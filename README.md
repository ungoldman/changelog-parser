# changelog-parser

[![npm][npm-img]][npm-url] [![travis][travis-img]][travis-url] [![standard][standard-image]][standard-url] [![downloads][downloads-img]][npm-url]

Change log parser for node.

[npm-img]: https://img.shields.io/npm/v/changelog-parser.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/changelog-parser
[travis-img]: https://img.shields.io/travis/hypermodules/changelog-parser.svg?style=flat-square
[travis-url]: https://travis-ci.org/hypermodules/changelog-parser
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://standardjs.com/
[downloads-img]: https://img.shields.io/npm/dm/changelog-parser.svg?style=flat-square

## Install

```
npm install changelog-parser
```

## Usage

This module exports a single function. It supports both callbacks and promises.

```js
var parseChangelog = require('changelog-parser')
```

### Callback

If provided with a callback, `parseChangelog` will invoke the function with the parsed changelog.

```js
parseChangelog('path/to/CHANGELOG.md', function (err, result) {
  if (err) throw err

  // changelog object
  console.log(result)
})
```

### Promise

If no callback is provided, `parseChangelog` will return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```js
parseChangelog('path/to/CHANGELOG.md')
  .then(function (result) {
    // changelog object
    console.log(result)
  })
  .catch(function (err) {
    // Whoops, something went wrong!
    console.error(err)
  })
```

### Options

You can optionally provide a configuration object `parseChangelog` function.

```js
parseChangelog({
  filePath: 'path/to/CHANGELOG.md',
  removeMarkdown: false // default: true
})
```

#### filePath

Path to changelog file.

#### text

Text of changelog file (you can use this instead of `filePath`).

#### removeMarkdown

Removes the markdown markup from the changelog entries by default. You can change its value to `false` to keep the markdown.

### Command-line interface

There is also a command-line interface available if you install it with `-g`.

```
npm install -g changelog-parser
```

This installs a program called `changelog-parser` that you simply pass a `CHANGELOG.md` file.

```
changelog-parser path/to/CHANGELOG.md
```

This will print the JSON object representing the change log to the terminal.

Alternately you can run it without arguments and it will look for a `CHANGELOG.md` file in the working directory.

## Standards

This module assumes your change log is a [markdown](http://daringfireball.net/projects/markdown/syntax) file structured roughly like so:

```markdown
# changelog title

A cool description (optional).

## unreleased
* foo

## x.y.z - YYYY-MM-DD (or DD.MM.YYYY, D/M/YY, etc.)
* bar

## [a.b.c]

### Changes

* Update API
* Fix bug #1

## 2.2.3-pre.1 - 2013-02-14
* Update API

## 2.0.0-x.7.z.92 - 2013-02-14
* bark bark
* woof
* arf

## v1.3.0

* make it so

## [1.2.3](link)
* init

[a.b.c]: http://altavista.com
```

Parsing the above example will return the following object:

```js
{
  title: 'changelog title',
  description: 'A cool description (optional).',
  versions: [
    { version: null,
      title: 'unreleased',
      date: null,
      body: '* foo',
      parsed: {
        _: [
          'foo'
        ]
      }
    },
    { version: 'x.y.z',
      title: 'x.y.z - YYYY-MM-DD',
      date: null,
      body: '* bar',
      parsed: {
        _: [
          'bar'
        ]
      }
    },
    { version: 'a.b.c',
      title: '[a.b.c]',
      date: null,
      body: '### Changes\n\n* Update API\n* Fix bug #1',
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
      date: '2013-02-14',
      body: '* Update API',
      parsed: {
        _: [
          'Update API'
        ]
      }
    },
    { version: '2.0.0-x.7.z.92',
      title: '2.0.0-x.7.z.92 - 2013-02-14',
      date: '2013-02-14',
      body: '* bark bark\n* woof\n* arf',
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
      date: null,
      body: '* make it so',
      parsed: {
        _: [
          'make it so'
        ]
      }
    },
    { version: '1.2.3',
      title: '[1.2.3](link)',
      date: null,
      body: '* init',
      parsed: {
        _: [
          'init'
        ]
      }
    }
  ]
}
```

Expects versions to be [semver](http://semver.org/) compliant, otherwise sets `version` to null.

Each entry is available as an object in the `versions` array. The body of a given entry can be accessed using the following properties:

- `body` - A string containing all of the updates/changes/etc. for the current entry. This property includes both plain text and markdown.
- `parsed` - An object which points to one or more arrays of data for the current entry. All data for the current entry is present in the array at key `_` (eg. `parsed._`). If the entry contains subheadings (eg. `### Added`, `### Changed`), then any items underneath each subheading will be present in an array at the corresponding key (eg. `parsed.Added`, `parsed.Changed`). Each array contains plain text.

`CHANGELOG.md` standards are inspired by [keepachangelog.com](http://keepachangelog.com/).

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## See Also

- [changelog-init](https://github.com/bcomnes/changelog-init)
- [gh-release](https://github.com/hypermodules/gh-release)

## License

[ISC](LICENSE.md)
