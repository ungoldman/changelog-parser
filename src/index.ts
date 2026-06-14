import { readFile } from 'node:fs/promises'
import removeMarkdown from 'remove-markdown'

/** Options accepted by {@link parseChangelog}. Provide either `filePath` or `text`. */
export interface ChangelogOptions {
  /** Path to a changelog file. */
  filePath?: string
  /** Raw changelog text (alternative to `filePath`). */
  text?: string
  /** Strip markdown from parsed entries. Defaults to `true`. */
  removeMarkdown?: boolean
}

/** A single version entry in the parsed changelog. */
export interface ChangelogVersion {
  /** Semver string if the heading is semver-compliant, otherwise `null`. */
  version: string | null
  /** The raw heading text. */
  title: string | null
  /** Date parsed from the heading if present, otherwise `null`. */
  date: string | null
  /** All content under the heading, as a single string. */
  body: string
  /**
   * List items grouped by subheading. The `_` key holds every list item;
   * each `### Subheading` adds a key with the items beneath it.
   */
  parsed: Record<string, string[]>
}

/** The parsed changelog. */
export interface Changelog {
  /** The document title (first H1), if present. */
  title?: string
  /** Free text between the title and the first version, if any. */
  description?: string
  /** Version entries in document order. */
  versions: ChangelogVersion[]
}

/** Node-style callback invoked with the parsed changelog. */
export type ChangelogCallback = (error: Error | null, changelog?: Changelog) => void

const defaultOptions: Required<Pick<ChangelogOptions, 'removeMarkdown'>> = {
  removeMarkdown: true
}

// patterns
const semver = /\[?v?([\w\d.-]+\.[\w\d.-]+[a-zA-Z0-9])\]?/
const date = /.*[ ]\(?(\d\d?\d?\d?[-/.]\d\d?[-/.]\d\d?\d?\d?)\)?.*/
const subhead = /^###/
const listitem = /^[*-]/
const lineSplit = /\r\n?|\n/
const htmlComment = /<!--[\s\S]*?-->/g
// a `[token]` whose `]` is not immediately followed by `(` or `[`, i.e. not an inline or full reference link
const standaloneBracket = /\[([^\][]*)\](?![([])/g
// a link reference definition line: `[label]: url`
const linkDefinition = /^\[([^[\]]+)\] *?:/
const bracketOpen = String.fromCharCode(0)
const bracketClose = String.fromCharCode(1)

interface ParseState {
  log: Changelog
  current: ChangelogVersion | null
  activeSubhead: string | null
}

/**
 * Parse a changelog from a file path or text string.
 *
 * Accepts a file path string, or an options object with `filePath` or `text`,
 * plus an optional `removeMarkdown` flag (default `true`). Returns a Promise;
 * if a callback is supplied it is invoked with `(error, changelog)` as well.
 */
function parseChangelog(
  options: string | ChangelogOptions,
  callback?: ChangelogCallback
): Promise<Changelog> {
  if (typeof options === 'undefined') throw new Error('missing options argument')
  if (typeof options === 'string') options = { filePath: options }
  if (typeof options === 'object') {
    const hasFilePath = typeof options.filePath !== 'undefined'
    const hasText = typeof options.text !== 'undefined'
    const invalidFilePath = typeof options.filePath !== 'string'
    const invalidText = typeof options.text !== 'string'

    if (!hasFilePath && !hasText) {
      throw new Error('must provide filePath or text')
    }

    if (hasFilePath && invalidFilePath) {
      throw new Error('invalid filePath, expected string')
    }

    if (hasText && invalidText) {
      throw new Error('invalid text, expected string')
    }
  }

  const opts = { ...defaultOptions, ...(options as ChangelogOptions) }
  const changelog = parse(opts)

  if (typeof callback === 'function') {
    changelog.then((log) => callback(null, log)).catch((err) => callback(err))
  }

  return changelog
}

/** Internal parsing logic. Reads the source, splits it into lines, and folds them into a changelog. */
async function parse(options: ChangelogOptions): Promise<Changelog> {
  const text =
    typeof options.text === 'string'
      ? options.text
      : await readFile(options.filePath as string, 'utf8')

  // strip HTML comments (single and multi-line) so they are not parsed as content
  const content = text.replace(htmlComment, '')
  const lines = content.split(lineSplit)

  // link reference definitions can appear anywhere in the document, so collect them first
  const definedLabels = new Set<string>()
  for (const line of lines) {
    const def = linkDefinition.exec(line)
    if (def) definedLabels.add(normalizeLabel(def[1]))
  }

  const state: ParseState = {
    log: { versions: [] },
    current: null,
    activeSubhead: null
  }

  for (const line of lines) {
    handleLine(state, options, line, definedLabels)
  }

  // push last version into log
  if (state.current) pushCurrent(state)

  // clean up description
  const description = clean(state.log.description)
  if (description === '') {
    delete state.log.description
  } else {
    state.log.description = description
  }

  return state.log
}

/** Handles a single line, mutating the parse state as needed. */
function handleLine(
  state: ParseState,
  options: ChangelogOptions,
  line: string,
  definedLabels: Set<string>
): void {
  // skip line if it's a link label
  if (line.match(/^\[[^[\]]*\] *?:/)) return

  // set title if it's there
  if (!state.log.title && line.match(/^# ?[^#]/)) {
    state.log.title = line.substring(1).trim()
    return
  }

  // new version found!
  if (line.match(/^##? ?[^#]/)) {
    // finalize the previous entry, including empty-title ones, matching the end-of-input flush
    if (state.current) pushCurrent(state)

    state.current = versionFactory()
    state.activeSubhead = null

    const semverMatch = semver.exec(line)
    if (semverMatch) state.current.version = semverMatch[1]

    state.current.title = line.substring(2).trim()

    const dateMatch = date.exec(state.current.title)
    if (dateMatch) state.current.date = dateMatch[1]

    return
  }

  // deal with body or description content
  if (state.current) {
    state.current.body += `${line}\n`

    // handle case where current line is a 'subhead':
    // - 'handleize' subhead.
    // - add subhead to 'parsed' data if not already present.
    if (subhead.exec(line)) {
      const key = line.replace('###', '').trim()

      if (!state.current.parsed[key]) {
        state.current.parsed[key] = []
        state.activeSubhead = key
      }
    }

    // handle case where current line is a 'list item':
    if (listitem.exec(line)) {
      const log = options.removeMarkdown ? stripMarkdown(line, definedLabels) : line
      // add line to 'catch all' array
      state.current.parsed._.push(log)

      // add line to 'active subhead' if applicable (eg. 'Added', 'Changed', etc.)
      if (state.activeSubhead) {
        state.current.parsed[state.activeSubhead].push(log)
      }
    }
  } else {
    state.log.description = `${state.log.description || ''}${line}\n`
  }
}

function versionFactory(): ChangelogVersion {
  return {
    version: null,
    title: null,
    date: null,
    body: '',
    parsed: {
      _: []
    }
  }
}

function pushCurrent(state: ParseState): void {
  const current = state.current as ChangelogVersion
  current.body = clean(current.body)
  state.log.versions.push(current)
}

// markdown reference labels are case-insensitive and collapse internal whitespace
function normalizeLabel(label: string): string {
  return label.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Strip markdown from a list item. A standalone `[token]` (not part of an inline or full
 * reference link) is resolved against the document's link reference definitions: if `token`
 * is defined elsewhere it is a shortcut reference link and renders as its text, so the
 * brackets are dropped; otherwise it is literal text and is preserved. Preserving also
 * sidesteps a remove-markdown bug where a standalone `[token]` followed by `(` is consumed
 * as the next link's text.
 */
function stripMarkdown(line: string, definedLabels: Set<string>): string {
  // fast path: with no brackets there is nothing to protect or resolve
  if (!line.includes('[')) return removeMarkdown(line)
  const protectedLine = line.replace(standaloneBracket, (_match, inner) => {
    if (definedLabels.has(normalizeLabel(inner))) return inner
    return `${bracketOpen}${inner}${bracketClose}`
  })
  return removeMarkdown(protectedLine).replaceAll(bracketOpen, '[').replaceAll(bracketClose, ']')
}

function clean(str: string | undefined): string {
  if (!str) return ''

  // trim
  str = str.trim()
  // remove leading newlines
  str = str.replace(/^\n*/, '')
  // remove trailing newlines
  str = str.replace(/\n*$/, '')

  return str
}

export default parseChangelog
export { parseChangelog }
