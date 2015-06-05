var parseChangelog = require('..')
var test = require('tape')
var endOfLine = require('os').EOL

var expected = {
  title: 'changelog title',
  description: 'A cool description (optional).',
  versions: [
    { version: null,
      title: 'unreleased',
      body: '* foo' },
    { version: 'x.y.z',
      title: 'x.y.z - YYYY-MM-DD',
      body: '* bar' },
    { version: 'a.b.c',
      title: '[a.b.c]',
      body: '### Changes' + endOfLine + endOfLine + '* Update API' + endOfLine + '* Fix bug #1' },
    { version: '2.2.3-pre.1',
      title: '2.2.3-pre.1 - 2013-02-14',
      body: '* Update API' },
    { version: '2.0.0-x.7.z.92',
      title: '2.0.0-x.7.z.92 - 2013-02-14',
      body: '* bark bark' + endOfLine + '* woof' + endOfLine + '* arf' },
    { version: '1.3.0',
      title: 'v1.3.0',
      body: '* make it so' },
    { version: '1.2.3',
      title: '[1.2.3](link)',
      body: '* init' }
  ]
}

test('meet expectations', function (t) {
  t.plan(1)

  parseChangelog(__dirname + '/CHANGELOG.md', function (err, result) {
    if (err) throw err

    t.deepEqual(result, expected)
    t.end()
  })
})
