<div align="center">

<img src="./log.png">

# changelog-parser

Change log parser for node.

[![npm][npm-image]][npm-url]
[![build][build-image]][build-url]
[![downloads][downloads-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/changelog-parser.svg
[npm-url]: https://www.npmjs.com/package/changelog-parser
[build-image]: https://github.com/ungoldman/changelog-parser/actions/workflows/tests.yml/badge.svg
[build-url]: https://github.com/ungoldman/changelog-parser/actions/workflows/tests.yml
[downloads-image]: https://img.shields.io/npm/dm/changelog-parser.svg

</div>

## Features

- Parses a `CHANGELOG.md` file (or raw text string) into a structured object: a title, an optional description, and an array of version entries.
- Extracts each version's number, date, body, and list items, grouped by `### subheading`.
- Promise-based, with a legacy Node-style callback also supported.
- Optionally strips markdown from parsed entries.

### Supported formats

These common changelog formats are officially supported:

- **[Keep a Changelog](https://keepachangelog.com/)**: `## [x.y.z] - YYYY-MM-DD` headings, `### Added` / `### Changed` / etc. sections
- **[Conventional Changelog](https://github.com/conventional-changelog/conventional-changelog)**: `## [x.y.z](compare) (date)` headings, with or without top-level title
- **[Release Please](https://github.com/googleapis/release-please)**: `## [x.y.z](compare) (date)` headings with `### ⚠ BREAKING CHANGES` section
- **[Standard Version](https://github.com/conventional-changelog/standard-version)**: headings set by release type (`#` major, `##` minor, `###` patch)

Maintained with 100% test coverage, verified on Linux, macOS, and Windows across all supported Node.js versions.

## Install

```
npm install changelog-parser
```

## Usage

This module is [ESM-only](https://antfu.me/posts/move-on-to-esm-only). It exports a named `parseChangelog` function that parses a changelog and returns a `Promise`.

```js
import { parseChangelog } from 'changelog-parser'

// async / await
const changelog = await parseChangelog('path/to/CHANGELOG.md')

// or as a promise
parseChangelog('path/to/CHANGELOG.md')
  .then((changelog) => console.log(changelog))
  .catch((err) => console.error(err))
```

A default export of the same function is also available (`import parseChangelog from 'changelog-parser'`).

CommonJS consumers on Node.js >= 22.12 can still `require()` it, but the function is no longer the module itself:

```js
const { parseChangelog } = require('changelog-parser')
```

### Callback

A Node-style callback is also supported. It was the original interface (the package predates native promises) and is kept for backwards compatibility. New code should use the returned promise.

```js
parseChangelog('path/to/CHANGELOG.md', (err, result) => {
  if (err) throw err

  console.log(result)
})
```

### Options

The first argument can be a path string or an options object (`string | ChangelogOptions`). You must provide either `filePath` or `text`.

```ts
interface ChangelogOptions {
  /** Path to a changelog file. */
  filePath?: string
  /** Raw changelog text (alternative to `filePath`). */
  text?: string
  /** Strip markdown from parsed entries. Defaults to `true`. */
  removeMarkdown?: boolean
}
```

### Command-line interface

There is also a command-line interface available.

```shell
npx changelog-parser <path-to-changelog.md> # invoke with npx
npm install -g changelog-parser # or install globally
```

This installs a program called `changelog-parser` that you simply pass a `CHANGELOG.md` file.

```
changelog-parser path/to/CHANGELOG.md
```

This will print the JSON object representing the change log to the terminal.

Alternately you can run it without arguments and it will look for a `CHANGELOG.md` file in the working directory.

## Migrating from 3.x

As of v4.0.0 this package is ESM-only. The API and output are otherwise unchanged.

- **ESM**: `import parseChangelog from 'changelog-parser'`, or the named `import { parseChangelog }`.
- **CommonJS**: a bare `require('changelog-parser')` no longer returns the function. On Node 22.12+, where `require()` of an ES module is supported, use `const { parseChangelog } = require('changelog-parser')`. On older Node, use a dynamic `import()`. Node 22.12+ is only needed for this path.
- `body` and `description` are now always joined with `\n` rather than the OS line ending, so output no longer varies by platform.

## Output

`parseChangelog` resolves to (and the callback receives) a `Changelog`. These types are exported.

```ts
interface Changelog {
  /** The document title (the first `#` heading that is not itself a version), if present. */
  title?: string
  /** Free text between the title and the first version, if any. */
  description?: string
  /** Version entries, in document order. */
  versions: ChangelogVersion[]
}

interface ChangelogVersion {
  /** Semver string if the heading is semver-compliant, otherwise `null`. */
  version: string | null
  /** The raw heading text. */
  title: string | null
  /** Date parsed from the heading if present, otherwise `null`. */
  date: string | null
  /** All content under the heading, as a single string. */
  body: string
  /**
   * List items grouped by subheading. The `_` key holds every list item;
   * each `### Subheading` adds a key with the items beneath it.
   */
  parsed: Record<string, string[]>
}
```

For example, this changelog:

```markdown
# Changelog

## [1.1.0] - 2024-03-15

### Added

* A `format` option.

### Fixed

* Squashed a bug.

## [1.0.0] - 2024-01-01

* First release.
```

parses to:

```js
{
  title: 'Changelog',
  versions: [
    {
      version: '1.1.0',
      title: '[1.1.0] - 2024-03-15',
      date: '2024-03-15',
      body: '### Added\n\n* A `format` option.\n\n### Fixed\n\n* Squashed a bug.',
      parsed: {
        _: ['A format option.', 'Squashed a bug.'],
        Added: ['A format option.'],
        Fixed: ['Squashed a bug.']
      }
    },
    {
      version: '1.0.0',
      title: '[1.0.0] - 2024-01-01',
      date: '2024-01-01',
      body: '* First release.',
      parsed: { _: ['First release.'] }
    }
  ]
}
```

Version headings can be `#`, `##`, or `###`. A `##` is always a version. A `#` is a version too, unless it is the document title (the first `#` heading that is not itself a version). A `###` is treated as a version only when it looks like one, so conventional-changelog and standard-version patch headings are captured instead of being read as a `### Section`.

The version number is read whether the heading is bare (`2.1.0`), `v`-prefixed (`v1.0.0`), or wrapped in brackets and optionally linked (`[0.9.0](...)`). It is `null` when the heading is not [semver](https://semver.org/)-compliant (such as `Unreleased`). Dates are recognized in common formats including `YYYY-MM-DD`, `DD.MM.YYYY`, and parenthesized `(YYYY-MM-DD)`.

`parsed` is flat: it captures one entry per top-level list item. Nested or indented sub-items are not split into their own entries, but the full original text (including any nesting) is always available in `body`.

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE.md)

Log image is from [emojipedia](https://emojipedia.org/wood/).
