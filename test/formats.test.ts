import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import parseChangelog from '../src/index.ts'

const dir = join(import.meta.dirname, 'fixtures', 'standards')
const parse = (name: string) => parseChangelog({ text: readFileSync(join(dir, name), 'utf8') })

test('Keep a Changelog', async () => {
  const r = await parse('keepachangelog.md')
  assert.equal(r.title, 'Changelog')
  assert.deepStrictEqual(
    r.versions.map((v) => v.version),
    [null, '1.1.0', '1.0.0']
  )
  assert.deepStrictEqual(
    r.versions.map((v) => v.date),
    [null, '2023-03-05', '2023-01-01']
  )
  assert.deepStrictEqual(Object.keys(r.versions[1].parsed), ['_', 'Added', 'Fixed'])
  assert.deepStrictEqual(r.versions[1].parsed.Added, ['A new option.'])
})

test('conventional-changelog (no title, mixed # and ##)', async () => {
  const r = await parse('conventional-changelog.md')
  // no document title, and the H1 major version is not stolen as the title
  assert.equal(r.title, undefined)
  assert.deepStrictEqual(
    r.versions.map((v) => v.version),
    ['1.2.0', '1.0.0']
  )
  assert.deepStrictEqual(
    r.versions.map((v) => v.date),
    ['2024-03-15', '2024-01-02']
  )
  assert.deepStrictEqual(Object.keys(r.versions[0].parsed), ['_', 'Features', 'Bug Fixes'])
  // the code span and commit link are stripped from the item
  assert.deepStrictEqual(r.versions[0].parsed.Features, ['add a format option (abc1234)'])
})

test('standard-version (# major, ## minor, ### patch)', async () => {
  const r = await parse('standard-version.md')
  assert.equal(r.title, 'Changelog')
  // the ### patch heading is parsed as a version, not as a section
  assert.deepStrictEqual(
    r.versions.map((v) => v.version),
    ['1.1.0', '1.0.1', '1.0.0']
  )
  assert.deepStrictEqual(
    r.versions.map((v) => v.date),
    ['2024-03-15', '2024-02-01', '2024-01-02']
  )
  assert.deepStrictEqual(r.versions[1].parsed['Bug Fixes'], ['a patch fix'])
})

test('auto-changelog (#### headings, blockquote dates)', async () => {
  const r = await parse('auto-changelog.md')
  // auto-changelog uses an h3 header rather than an h1, so there is no document title
  assert.equal(r.title, undefined)
  assert.match(r.description ?? '', /All notable changes/)
  // #### version headings are recognized, linked or bare (the first release has no
  // prior tag to compare against, so auto-changelog emits a bare `#### v1.0.0`)
  assert.deepStrictEqual(
    r.versions.map((v) => v.version),
    ['1.1.0', '1.0.0']
  )
  assert.equal(r.versions[1].title, 'v1.0.0')
  // dates come from the `> 5 March 2023` blockquote under each heading
  assert.deepStrictEqual(
    r.versions.map((v) => v.date),
    ['2023-03-05', '2023-01-01']
  )
  assert.deepStrictEqual(r.versions[0].parsed._, ['add a format option b203a37'])
})

test('release-please', async () => {
  const r = await parse('release-please.md')
  assert.equal(r.title, 'Changelog')
  assert.deepStrictEqual(
    r.versions.map((v) => v.version),
    ['2.0.0', '1.1.0']
  )
  assert.deepStrictEqual(Object.keys(r.versions[0].parsed), [
    '_',
    '⚠ BREAKING CHANGES',
    'Features',
    'Bug Fixes'
  ])
  assert.deepStrictEqual(r.versions[0].parsed['Bug Fixes'], ['a fix (def5678)'])
})
