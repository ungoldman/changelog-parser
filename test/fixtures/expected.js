var EOL = require('os').EOL

module.exports = {
  title: 'changelog title',
  description: 'A cool description (optional).',
  versions: [
    {
      version: null,
      title: 'unreleased',
      'date': null,
      body: '* foo',
      parsed: {
        _: [
          'foo'
        ]
      }
    },
    {
      version: 'x.y.z',
      title: 'x.y.z - YYYY-MM-DD',
      'date': null,
      body: '* bar',
      parsed: {
        _: [
          'bar'
        ]
      }
    },
    {
      version: 'a.b.c',
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
    {
      version: '2.3.0',
      title: '2.3.0 - 2018-12-18',
      'date': '2018-12-18',
      body: '### Added' + EOL + EOL + '- Some changelog generators such as [standard-version](https://github.com/conventional-changelog/standard-version) would produce H1s for major versions and H2s for minor versions. We want the parser to be able to parse both.',
      parsed: {
        _: [
          'Some changelog generators such as standard-version would produce H1s for major versions and H2s for minor versions. We want the parser to be able to parse both.'
        ],
        Added: [
          'Some changelog generators such as standard-version would produce H1s for major versions and H2s for minor versions. We want the parser to be able to parse both.'
        ]
      }
    },
    {
      version: '2.2.3-pre.1',
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
    {
      version: '2.0.0-x.7.z.92',
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
    {
      version: '1.3.0',
      title: 'v1.3.0',
      'date': null,
      body: '* make it so',
      parsed: {
        _: [
          'make it so'
        ]
      }
    },
    {
      version: '1.2.3',
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
