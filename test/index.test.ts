import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import fc from 'fast-check'
import removeMarkdown from 'remove-markdown'
import parseChangelog from '../src/index.ts'
import expected from './fixtures/expected.ts'
import removeMarkdownExpected from './fixtures/remove-markdown-expected.ts'

const filePath = join(import.meta.dirname, 'fixtures', 'CHANGELOG.md')

test('throws on bad params', () => {
  assert.throws(() => (parseChangelog as (o?: unknown) => unknown)(), /missing options argument/)
  assert.throws(() => parseChangelog({}), /must provide filePath or text/)
  assert.throws(
    () => parseChangelog({ filePath: 0 as unknown as string }),
    /invalid filePath, expected string/
  )
  assert.throws(
    () => parseChangelog({ text: 0 as unknown as string }),
    /invalid text, expected string/
  )
})

test('parses example changelog (callback)', async () => {
  await new Promise<void>((resolve, reject) => {
    parseChangelog(filePath, (err, result) => {
      if (err) return reject(err)
      assert.deepStrictEqual(result, expected)
      resolve()
    })
  })
})

test('parses example changelog as text', async () => {
  const result = await parseChangelog({ text: readFileSync(filePath, 'utf8') })
  assert.deepStrictEqual(result, expected)
})

test('returns a Promise when invoked without a callback', () => {
  const result = parseChangelog(filePath)
  assert.ok(result instanceof Promise)
})

test('resolved Promise contains the changelog object', async () => {
  const result = await parseChangelog(filePath)
  assert.deepStrictEqual(result, expected)
})

test('callback and Promise yield identical values', async () => {
  const viaPromise = await parseChangelog(filePath)
  const viaCallback = await new Promise((resolve, reject) => {
    parseChangelog(filePath, (err, result) => (err ? reject(err) : resolve(result)))
  })
  assert.deepStrictEqual(viaCallback, viaPromise)
})

test('accepts object as first argument', async () => {
  const result = await parseChangelog({ filePath })
  assert.deepStrictEqual(result, expected)
})

test('accepts { removeMarkdown: false } option', async () => {
  const result = await parseChangelog({ filePath, removeMarkdown: false })
  assert.deepStrictEqual(result, removeMarkdownExpected)
})

test('passes the error to the callback for a missing file', async () => {
  await new Promise<void>((resolve) => {
    parseChangelog('does-not-exist.md', (err) => {
      assert.ok(err instanceof Error)
      resolve()
    })
  })
})

test('rejects the Promise for a missing file', async () => {
  await assert.rejects(parseChangelog('does-not-exist.md'))
})

test('omits description when there is none', async () => {
  const result = await parseChangelog({ text: '# title\n## 1.0.0\n* a' })
  assert.ok(!('description' in result))
})

test('does not duplicate a repeated subheading within a version', async () => {
  const result = await parseChangelog({
    text: '# t\n\n## 1.0.0\n\n### Added\n- a\n\n### Added\n- b\n',
    removeMarkdown: false
  })
  assert.deepStrictEqual(result.versions[0].parsed.Added, ['- a', '- b'])
})

test('ignores HTML comments (#33)', async () => {
  const text = [
    '# Changelog',
    '<!-- top-level comment -->',
    '',
    '## 1.0.0',
    '<!--',
    'multi-line comment',
    '-->',
    '* real item',
    ''
  ].join('\n')
  const result = await parseChangelog({ text, removeMarkdown: false })

  assert.equal(result.versions.length, 1)
  assert.deepStrictEqual(result.versions[0].parsed._, ['* real item'])
  assert.ok(!('description' in result))
  assert.ok(!result.versions[0].body.includes('comment'))
})

test('keeps an entry with an empty (whitespace-only) heading', async () => {
  // A heading that trims to an empty title still yields an entry, rather than
  // being silently dropped when the next heading appears.
  const result = await parseChangelog({ text: '# t\n\n##  \n* a\n\n## 1.0.0\n* b\n' })
  assert.deepStrictEqual(
    result.versions.map((v) => ({ version: v.version, title: v.title, items: v.parsed._ })),
    [
      { version: null, title: '', items: ['a'] },
      { version: '1.0.0', title: '1.0.0', items: ['b'] }
    ]
  )
})

test('recognizes a version-like heading at any depth', async () => {
  // a version-like heading is a version regardless of level (auto-changelog uses ####),
  // while a non-version ### remains a section
  const r = await parseChangelog({ text: '# t\n\n#### 2.0.0\n\n### Added\n- a\n' })
  assert.deepStrictEqual(
    r.versions.map((v) => v.version),
    ['2.0.0']
  )
  assert.deepStrictEqual(r.versions[0].parsed.Added, ['a'])
})

test('reads a textual date from a heading (Month D, YYYY)', async () => {
  const r = await parseChangelog({ text: '# t\n\n## [1.0.0] - January 20, 2021\n* a\n' })
  assert.equal(r.versions[0].date, '2021-01-20')
})

test('reads a date from a blockquote under the heading', async () => {
  const r = await parseChangelog({ text: '# t\n\n## 1.0.0\n\n> 5 March 2023\n\n* a\n' })
  assert.equal(r.versions[0].date, '2023-03-05')
})

test('leaves the date null for an unknown month name', async () => {
  const r = await parseChangelog({ text: '# t\n\n## 1.0.0\n\n> 20 Foo 2021\n\n* a\n' })
  assert.equal(r.versions[0].date, null)
})

test('leaves the date null for a non-date blockquote', async () => {
  const r = await parseChangelog({ text: '# t\n\n## 1.0.0\n\n> just a note\n\n* a\n' })
  assert.equal(r.versions[0].date, null)
})

test('a heading date is not overridden by a later blockquote', async () => {
  const r = await parseChangelog({
    text: '# t\n\n## [1.0.0] - 2024-01-02\n\n> 5 March 2023\n\n* a\n'
  })
  assert.equal(r.versions[0].date, '2024-01-02')
})

test('a blockquote after content is not read as the date', async () => {
  const r = await parseChangelog({ text: '# t\n\n## 1.0.0\n\n* a\n\n> 5 March 2023\n' })
  assert.equal(r.versions[0].date, null)
})

test('parses a CRLF file identically to LF (#34)', async () => {
  const lf = readFileSync(filePath, 'utf8')
  const crlf = lf.replace(/\n/g, '\r\n')
  const dir = mkdtempSync(join(tmpdir(), 'changelog-parser-'))
  const crlfPath = join(dir, 'CHANGELOG.md')
  writeFileSync(crlfPath, crlf)

  const fromCrlfFile = await parseChangelog(crlfPath)
  const fromLfText = await parseChangelog({ text: lf })

  assert.deepStrictEqual(fromCrlfFile, fromLfText)
  assert.deepStrictEqual(fromCrlfFile, expected)
})

test('property: every version heading yields one entry, regardless of line endings', async () => {
  const version = fc
    .tuple(
      fc.integer({ min: 0, max: 99 }),
      fc.integer({ min: 0, max: 99 }),
      fc.integer({ min: 0, max: 99 })
    )
    .map(([major, minor, patch]) => `${major}.${minor}.${patch}`)
  const item = fc.stringMatching(/^[a-z][a-z ]{0,30}$/)
  const eol = fc.constantFrom('\n', '\r\n')

  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.record({ version, item }), { minLength: 1, maxLength: 8 }),
      eol,
      async (entries, sep) => {
        const text = [
          '# changelog',
          '',
          ...entries.flatMap(({ version, item }) => [`## ${version}`, `* ${item}`, ''])
        ].join(sep)

        const result = await parseChangelog({ text })

        assert.equal(result.versions.length, entries.length)
        for (const [i, entry] of entries.entries()) {
          assert.equal(result.versions[i].version, entry.version)
          assert.deepStrictEqual(result.versions[i].parsed._, [entry.item])
        }
      }
    )
  )
})

test('resolves standalone brackets against link definitions (#46)', async () => {
  const text = [
    '# Changelog',
    '',
    '## 1.0.0',
    '* add some new stuff [incomplete] ([abc](https://x/abc))',
    '* see [defined] for details',
    '* keep [undefined] literal',
    '',
    '[defined]: https://example.com'
  ].join('\n')
  const result = await parseChangelog({ text })

  assert.deepStrictEqual(result.versions[0].parsed._, [
    // [incomplete] has no definition, so it stays literal; the real [abc](url) link strips
    'add some new stuff [incomplete] (abc)',
    // [defined] resolves to a definition below, so it is a link and renders as its text
    'see defined for details',
    // [undefined] has no definition, so it stays literal
    'keep [undefined] literal'
  ])
})

test('property: stripping bracket-free items matches remove-markdown', async () => {
  const safe = fc
    .string()
    .filter((s) => !s.includes('[') && !s.includes(']') && !s.includes('\n') && !s.includes('\r'))

  await fc.assert(
    fc.asyncProperty(safe, async (item) => {
      const result = await parseChangelog({ text: `# t\n\n## 1.0.0\n* ${item}\n` })
      assert.equal(result.versions[0].parsed._[0], removeMarkdown(`* ${item}`))
    })
  )
})
