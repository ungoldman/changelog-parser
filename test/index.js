var parseChangelog = require('..')
var test = require('tape')
var EOL = require('os').EOL
var path = require('path')

var expected = {
  title: 'changelog title',
  description: 'A cool description (optional).',
  versions: [
    { version: null,
      title: 'unreleased',
      'date': null,
      body: '* foo',
      parsed: {
        _: [
          'foo'
        ]
      }
    },
    { version: 'x.y.z',
      title: 'x.y.z - YYYY-MM-DD',
      'date': null,
      body: '* bar',
      parsed: {
        _: [
          'bar'
        ]
      }
    },
    { version: 'a.b.c',
      title: '[a.b.c]',
      'date': null,
      body: '### Changes' + EOL + EOL + '* Update API' + EOL + '* Fix bug #1',
      parsed: {
        _: [
          'Update API',
          'Fix bug #1'
        ],
        Changes: [
          'Update API',
          'Fix bug #1'
        ]
      }
    },
    { version: '2.2.3-pre.1',
      title: '2.2.3-pre.1 - 2013-02-14',
      'date': '2013-02-14',
      body: '### Added' + EOL + '- Added an item.' + EOL + '* Added another item.' + EOL + EOL + '* Update API',
      parsed: {
        _: [
          'Added an item.',
          'Added another item.',
          'Update API'
        ],
        Added: [
          'Added an item.',
          'Added another item.',
          'Update API'
        ]
      }
    },
    { version: '2.0.0-x.7.z.92',
      title: '2.0.0-x.7.z.92 - 2013-02-14',
      'date': '2013-02-14',
      body: '* bark bark' + EOL + '* woof' + EOL + '* arf',
      parsed: {
        _: [
          'bark bark',
          'woof',
          'arf'
        ]
      }
    },
    { version: '1.3.0',
      title: 'v1.3.0',
      'date': null,
      body: '* make it so',
      parsed: {
        _: [
          'make it so'
        ]
      }
    },
    { version: '1.2.3',
      title: '[1.2.3](link)',
      'date': null,
      body: '* init',
      parsed: {
        _: [
          'init'
        ]
      }
    }
  ]
}

test('meet expectations', function (t) {
  t.plan(1)

  parseChangelog(path.join(__dirname, 'CHANGELOG.md'), function (err, result) {
    if (err) throw err

    t.deepEqual(result, expected)
    t.end()
  })
})

test('returns a Promise when invoked without a valid `callback`', function (t) {
  t.plan(2)

  var result = parseChangelog(path.join(__dirname, 'CHANGELOG.md'))

  t.true(typeof result === 'object')
  t.true(result instanceof Promise)
})

test('resolved Promise contains a "CHANGELOG" object', function (t) {
  t.plan(1)

  parseChangelog(path.join(__dirname, 'CHANGELOG.md')).then(function (result) {
    t.deepEqual(result, expected)
    t.end()
  })
})

test('callback and Promise methods should yield identical values', function (t) {
  t.plan(1)

  parseChangelog(path.join(__dirname, 'CHANGELOG.md'), function (err, resultA) {
    if (err) t.fail()

    parseChangelog(path.join(__dirname, 'CHANGELOG.md'))
            .then(function (resultB) {
              t.deepEqual(resultA, resultB)
              t.end()
            })
            .catch(t.fail)
  })
})
