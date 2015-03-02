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

Parsing the above example will return the following object:

```js
{
  title: 'changelog title',
  description: 'A cool description (optional).\n\n'
  versions: [{
    version: 'unreleased',
    body: '* foo\n\n'
  }, {
    version: 'x.y.z',
    body: '* bar\n\n'
  }, {
    version: 'a.b.c',
    body: '### Changes\n* Update API\n* Fix bug #1\n\n'
  }, {
    version: '2.2.3-pre.1',
    body: '* Update API\n\n'
  }, {
    version: '1.0.0-x.7.z.92',
    body: '* bark bark\n* woof\n* arf\n\n'
  }, {
    version: '1.2.3',
    body: '* init\n\n'
  }]
}
```

Expects a version to be semver compliant, otherwise treats it as a plain string.

`CHANGELOG.md` standards are inspired by [keepachangelog.com](http://keepachangelog.com/).

## License

[ISC](LICENSE.md)
