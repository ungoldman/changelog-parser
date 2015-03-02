# changelog-parser

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
# title

description (optional)

## unreleased
* foo

## x.y.z - YYYY-MM-DD
* bar

## [a.b.c]

### Breaking Changes
* baz

## [1.2.3](link)

[a.b.c]: http://altavista.com
```

Expects versions to be semver compliant, otherwise treats them as plain strings.

`CHANGELOG.md` standards are inspired by [keepachangelog.com](http://keepachangelog.com/).

## License

[ISC](LICENSE.md)
