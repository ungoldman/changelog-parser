const parseChangelog = require('..')
const test = require('tape')
const path = require('path')
const fs = require('fs')
const expected = require('./fixtures/expected')
const removeMarkdownExpected = require('./fixtures/remove-markdown-expected')
const filePath = path.join(__dirname, 'fixtures', 'CHANGELOG.md')

test('throws on bad params', function (t) {
  t.plan(3)

  const missing = 'must provide filePath or text'
  const invalidPath = 'invalid filePath, expected string'
  const invalidText = 'invalid text, expected string'

  t.throws(parseChangelog, missing, missing)
  t.throws(function () {
    parseChangelog({ filePath: 0 })
  }, invalidPath, invalidPath)
  t.throws(function () {
    parseChangelog({ text: 0 })
  }, invalidText, invalidText)
})

test('parses example changelog', function (t) {
  t.plan(1)

  parseChangelog(filePath, function (err, result) {
    if (err) throw err

    t.deepEqual(result, expected)
    t.end()
  })
})

test('parses example changelog as text', function (t) {
  t.plan(1)

  parseChangelog({ text: fs.readFileSync(filePath, 'utf8') }, function (err, result) {
    if (err) throw err

    t.deepEqual(result, expected)
    t.end()
  })
})

test('returns a Promise when invoked without a valid `callback`', function (t) {
  t.plan(2)

  const result = parseChangelog(filePath)

  t.true(typeof result === 'object')
  t.true(result instanceof Promise)
})

test('resolved Promise contains a "CHANGELOG" object', function (t) {
  t.plan(1)

  parseChangelog(filePath).then(function (result) {
    t.deepEqual(result, expected)
    t.end()
  })
})

test('callback and Promise methods should yield identical values', function (t) {
  t.plan(1)

  parseChangelog(filePath, function (err, resultA) {
    if (err) t.fail()

    parseChangelog(filePath)
      .then(function (resultB) {
        t.deepEqual(resultA, resultB)
        t.end()
      })
      .catch(t.fail)
  })
})

test('accepts object as first argument', function (t) {
  t.plan(1)

  parseChangelog({ filePath: filePath }, function (err, result) {
    if (err) throw err

    t.deepEqual(result, expected)
    t.end()
  })
})

test('accepts { removeMardown: false } option', function (t) {
  t.plan(1)

  const options = {
    filePath: filePath,
    removeMarkdown: false
  }

  parseChangelog(options, function (err, result) {
    if (err) throw err

    t.deepEqual(result, removeMarkdownExpected)
    t.end()
  })
})
