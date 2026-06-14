<div align="center">

<img src="./log.png">

# changelog-parser

[![npm][npm-image]][npm-url]
[![build][build-image]][build-url]
[![downloads][downloads-image]][npm-url]

Change log parser for node.

[npm-image]: https://img.shields.io/npm/v/changelog-parser.svg
[npm-url]: https://www.npmjs.com/package/changelog-parser
[build-image]: https://github.com/ungoldman/changelog-parser/actions/workflows/tests.yml/badge.svg
[build-url]: https://github.com/ungoldman/changelog-parser/actions/workflows/tests.yml
[downloads-image]: https://img.shields.io/npm/dm/changelog-parser.svg

</div>

## Install

```
npm install changelog-parser
```

## Supported formats

`changelog-parser` parses these common changelog formats:

- [Keep a Changelog](https://keepachangelog.com/): `## [x.y.z] - YYYY-MM-DD` headings with `### Added` / `### Changed` / etc. sections
- [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog): `## [x.y.z](compare) (date)` headings, with or without a top-level title
- [standard-version](https://github.com/conventional-changelog/standard-version): heading level set by release type (`#` major, `##` minor, `###` patch)
- [release-please](https://github.com/googleapis/release-please): `## [x.y.z](compare) (date)` headings with a `### ⚠ BREAKING CHANGES` section

Version headings may be `#`, `##`, or `###`, with or without a `[bracketed]` and/or linked version, and with a date in several formats. A document title (the first `# Heading` that is not itself a version) is optional.

## Usage

This module is [ESM-only](https://nodejs.org/api/esm.html) and requires Node.js >= 22.12. It exports a single function, available as both a default and a named export. It supports both callbacks and promises.

```js
import parseChangelog from 'changelog-parser'
// or: import { parseChangelog } from 'changelog-parser'
```

CommonJS consumers on Node.js >= 22.12 can still `require()` it, but the function is no longer the module itself:

```js
const { parseChangelog } = require('changelog-parser')
```

### Callback

If provided with a callback, `parseChangelog` will invoke the function with the parsed changelog.

```js
parseChangelog('path/to/CHANGELOG.md', (err, result) => {
  if (err) throw err

  // changelog object
  console.log(result)
})
```

### Promise

If no callback is provided, `parseChangelog` will return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```js
parseChangelog('path/to/CHANGELOG.md')
  .then((result) => {
    // changelog object
    console.log(result)
  })
  .catch((err) => {
    // Whoops, something went wrong!
    console.error(err)
  })
```

### Options

You can optionally provide a configuration object `parseChangelog` function.

You must provide either `filePath` or `text`.

#### filePath

Path to changelog file.

```js
parseChangelog({
  filePath: 'path/to/CHANGELOG.md'
})
```

#### text

Text of changelog file (you can use this instead of `filePath`).

```js
parseChangelog({
  text: 'raw changelog text in string format'
})
```

#### removeMarkdown

Removes the markdown markup from the changelog entries by default. You can change its value to `false` to keep the markdown.

```js
parseChangelog({
  filePath: 'path/to/CHANGELOG.md',
  removeMarkdown: false // default: true
})
```

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

## Migrating from 3.x

4.0.0 is ESM-only. The API and output are otherwise unchanged.

- **ESM**: `import parseChangelog from 'changelog-parser'`, or the named `import { parseChangelog }`.
- **CommonJS**: a bare `require('changelog-parser')` no longer returns the function. On Node 22.12+, where `require()` of an ES module is supported, use `const { parseChangelog } = require('changelog-parser')`. On older Node, use a dynamic `import()`. Node 22.12+ is only needed for this path.
- `body` and `description` are now always joined with `\n` rather than the OS line ending, so output no longer varies by platform.

## Standards

This module assumes your change log is a [markdown](http://daringfireball.net/projects/markdown/syntax) file structured roughly like so:

```markdown
# Changelog

All notable changes to this project are documented in this file.

## Unreleased

* Work in progress.

## 2.2.0-beta.1 - 2024-03-20

* Pre-release builds get a version too.

## [2.1.0] - 2024-03-15

### Added

* A `format` option, documented in [the README](https://example.com).
* Support for **bold** entries.

### Fixed

- A crash on empty input.

## 2.0.0 (2024-01-02)

* Drop support for Node 12.

# 1.5.0 - 02.11.2023

* An older entry under an H1 heading with a `DD.MM.YYYY` date.

## v1.0.0

* First stable release.

## [0.9.0](https://example.com/releases/0.9.0)

* Initial public prototype.

[2.1.0]: https://example.com/releases/2.1.0
```

Parsing the above example will return the following object:

```js
{
  title: 'Changelog',
  description: 'All notable changes to this project are documented in this file.',
  versions: [
    { version: null,
      title: 'Unreleased',
      date: null,
      body: '* Work in progress.',
      parsed: {
        _: [
          'Work in progress.'
        ]
      }
    },
    { version: '2.2.0-beta.1',
      title: '2.2.0-beta.1 - 2024-03-20',
      date: '2024-03-20',
      body: '* Pre-release builds get a version too.',
      parsed: {
        _: [
          'Pre-release builds get a version too.'
        ]
      }
    },
    { version: '2.1.0',
      title: '[2.1.0] - 2024-03-15',
      date: '2024-03-15',
      body: '### Added\n\n* A `format` option, documented in [the README](https://example.com).\n* Support for **bold** entries.\n\n### Fixed\n\n- A crash on empty input.',
      parsed: {
        _: [
          'A format option, documented in the README.',
          'Support for bold entries.',
          'A crash on empty input.'
        ],
        Added: [
          'A format option, documented in the README.',
          'Support for bold entries.'
        ],
        Fixed: [
          'A crash on empty input.'
        ]
      }
    },
    { version: '2.0.0',
      title: '2.0.0 (2024-01-02)',
      date: '2024-01-02',
      body: '* Drop support for Node 12.',
      parsed: {
        _: [
          'Drop support for Node 12.'
        ]
      }
    },
    { version: '1.5.0',
      title: '1.5.0 - 02.11.2023',
      date: '02.11.2023',
      body: '* An older entry under an H1 heading with a `DD.MM.YYYY` date.',
      parsed: {
        _: [
          'An older entry under an H1 heading with a DD.MM.YYYY date.'
        ]
      }
    },
    { version: '1.0.0',
      title: 'v1.0.0',
      date: null,
      body: '* First stable release.',
      parsed: {
        _: [
          'First stable release.'
        ]
      }
    },
    { version: '0.9.0',
      title: '[0.9.0](https://example.com/releases/0.9.0)',
      date: null,
      body: '* Initial public prototype.',
      parsed: {
        _: [
          'Initial public prototype.'
        ]
      }
    }
  ]
}
```

Expects versions to be [semver](http://semver.org/) compliant, otherwise sets `version` to null.

Both `#` and `##` headings are treated as versions. The version number is read from the heading whether it is bare (`2.1.0`), `v`-prefixed (`v1.0.0`), or wrapped in brackets and optionally linked (`[0.9.0](...)`), and dates are recognized in common formats such as `YYYY-MM-DD`, `DD.MM.YYYY`, and parenthesized `(YYYY-MM-DD)`.

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

Log image is from [emojipedia](https://emojipedia.org/wood/).
