import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { test } from 'node:test'
import expected from './fixtures/expected.ts'

// Smoke tests for the built CLI. Requires `npm run build` first (the test and
// coverage scripts build before running). The CLI is excluded from the coverage
// gate; this exercises it end to end in a subprocess.
const cli = join(import.meta.dirname, '..', 'dist', 'cli.js')
const filePath = join(import.meta.dirname, 'fixtures', 'CHANGELOG.md')

test('CLI prints the parsed changelog as JSON', () => {
  const out = execFileSync('node', [cli, filePath], { encoding: 'utf8' })
  assert.deepStrictEqual(JSON.parse(out), expected)
})

test('CLI prints usage with --help', () => {
  const out = execFileSync('node', [cli, '--help'], { encoding: 'utf8' })
  assert.match(out, /usage: changelog-parser/)
})
