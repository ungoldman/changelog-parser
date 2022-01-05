var parseChangelog = require('..')
var test = require('tape')
var path = require('path')
var fs = require('fs')
var getExpectedForLineEnding = require('./fixtures/expected')
var getRemoveMarkdownExpected = require('./fixtures/remove-markdown-expected')
var filePathLF = path.join(__dirname, 'fixtures', 'CHANGELOG_lf.md')
var filePathCRLF = path.join(__dirname, 'fixtures', 'CHANGELOG_crlf.md')

function createTestsForFilePath (filePath) {
  var lineEndingsStyle = filePath === filePathCRLF ? 'Windows' : 'Unix'
  var lineEndings = filePath === filePathCRLF ? '\r\n' : '\n'
  var testPrefix = lineEndingsStyle + ' style line endings: '
  var expected = getExpectedForLineEnding(lineEndings)
  var removeMarkdownExpected = getRemoveMarkdownExpected(lineEndings)

  test(testPrefix + 'throws on bad params', function (t) {
    t.plan(3)

    var missing = 'must provide filePath or text'
    var invalidPath = 'invalid filePath, expected string'
    var invalidText = 'invalid text, expected string'

    t.throws(parseChangelog, missing, missing)
    t.throws(function () {
      parseChangelog({ filePath: 0 })
    }, invalidPath, invalidPath)
    t.throws(function () {
      parseChangelog({ text: 0 })
    }, invalidText, invalidText)
  })

  test(testPrefix + 'parses example changelog', function (t) {
    t.plan(1)

    parseChangelog(filePath, function (err, result) {
      if (err) throw err

      t.deepEqual(result, expected)
      t.end()
    })
  })

  test(testPrefix + 'parses example changelog as text', function (t) {
    t.plan(1)

    parseChangelog({text: fs.readFileSync(filePath, 'utf8')}, function (err, result) {
      if (err) throw err

      t.deepEqual(result, expected)
      t.end()
    })
  })

  test(testPrefix + 'returns a Promise when invoked without a valid `callback`', function (t) {
    t.plan(2)

    var result = parseChangelog(filePath)

    t.true(typeof result === 'object')
    t.true(result instanceof Promise)
  })

  test(testPrefix + 'resolved Promise contains a "CHANGELOG" object', function (t) {
    t.plan(1)

    parseChangelog(filePath).then(function (result) {
      t.deepEqual(result, expected)
      t.end()
    })
  })

  test(testPrefix + 'callback and Promise methods should yield identical values', function (t) {
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

  test(testPrefix + 'accepts object as first argument', function (t) {
    t.plan(1)

    parseChangelog({ filePath: filePath }, function (err, result) {
      if (err) throw err

      t.deepEqual(result, expected)
      t.end()
    })
  })

  test(testPrefix + 'accepts { removeMardown: false } option', function (t) {
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
}
createTestsForFilePath(filePathLF)
createTestsForFilePath(filePathCRLF)
