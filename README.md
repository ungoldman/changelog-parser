# changelog-parser

[![](https://img.shields.io/npm/v/changelog-parser.svg?style=flat-square)](https://www.npmjs.com/package/changelog-parser)
[![](https://img.shields.io/travis/ngoldman/changelog-parser.svg?style=flat-square)](https://travis-ci.org/ngoldman/changelog-parser)

Change log parser for node.

## Usage

```
npm install changelog-parser
```

```js
var parseChangelog = require('changelog-parser')

parseChangelog('path/to/CHANGELOG.md', function (err, result) {
  if (err) throw err

  // changelog object
  console.log(result)
})
```

## Standards

This module assumes your changelog is:

1. A markdown file
1. Structured roughly like so:

```md
# changelog title

A cool description (optional).

## unreleased
* foo

## x.y.z - YYYY-MM-DD
* bar

## [a.b.c]

### Changes

* Update API
* Fix bug #1

## 2.2.3-pre.1 - 2013-02-14
* Update API

## 1.0.0-x.7.z.92 - 2013-02-14
* bark bark
* woof
* arf

## [1.2.3](link)
* init

[a.b.c]: http://altavista.com
```

Parsing the above example will return the following object:

```js
{ versions:
   [ { version: 'unreleased', body: '* foo' },
     { version: 'x.y.z', body: '* bar' },
     { version: 'a.b.c',
       body: '### Changes\n\n* Update API\n* Fix bug #1' },
     { version: '2.2.3-pre.1', body: '* Update API' },
     { version: '1.0.0-x.7.z.92',
       body: '* bark bark\n* woof\n* arf' },
     { version: '1.2.3', body: '* init' } ],
  title: 'changelog title',
  description: 'A cool description (optional).' }
```

Expects a version to be [semver](http://semver.org/) compliant, otherwise treats it as a plain string.

`CHANGELOG.md` standards are inspired by [keepachangelog.com](http://keepachangelog.com/).

## Contributing

`changelog-parser` is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more details.

## License

[ISC](LICENSE.md)
