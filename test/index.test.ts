import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import fc from 'fast-check'
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

test('drops a mid-stream entry with an empty (whitespace-only) heading', async () => {
  // Documents existing behavior: a heading that trims to an empty title is not
  // finalized when the next heading appears.
  const result = await parseChangelog({ text: '# t\n\n##  \n* a\n\n## 1.0.0\n* b\n' })
  assert.deepStrictEqual(
    result.versions.map((v) => v.version),
    ['1.0.0']
  )
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
