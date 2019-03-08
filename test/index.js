var parseChangelog = require('..')
var test = require('tape')
var path = require('path')
var expected = require('./fixtures/expected')
var removeMarkdownExpected = require('./fixtures/remove-markdown-expected')
var filePath = path.join(__dirname, 'fixtures', 'CHANGELOG.md')

test('parses example changelog', function (t) {
  t.plan(1)

  parseChangelog(filePath, function (err, result) {
    if (err) throw err

    t.deepEqual(result, expected)
    t.end()
  })
})

test('returns a Promise when invoked without a valid `callback`', function (t) {
  t.plan(2)

  var result = parseChangelog(filePath)

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

  var options = {
    filePath: filePath,
    removeMarkdown: false
  }

  parseChangelog(options, function (err, result) {
    if (err) throw err

    t.deepEqual(result, removeMarkdownExpected)
    t.end()
  })
})
