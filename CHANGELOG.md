# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.8.0](https://github.com/hypermodules/changelog-parser/compare/v2.7.0...v2.8.0) - 2019-05-02

### Features

- accept input text instead of file (#32) - @jedwards1211 & @ungoldman

## [2.7.0](https://github.com/hypermodules/changelog-parser/compare/v2.6.0...v2.7.0) - 2019-03-07

### Features

- accept options object, add removeMarkdown option (#29) - @cironunes & @ungoldman

## [2.6.0](https://github.com/hypermodules/changelog-parser/compare/v2.5.0...v2.5.1) - 2018-12-18

### Features

- allow version headers in CHANGELOG to use either H1 (#) or H2 (##) headers (#14) - @eladb

## [2.5.1](https://github.com/hypermodules/changelog-parser/compare/v2.5.0...v2.5.1) - 2018-12-05

### Fixes

- Protect against no current value (#24) - thanks @sabrehagen

## [2.5.0](https://github.com/hypermodules/changelog-parser/compare/v2.4.0...v2.5.0) - 2018-05-30

### Features

- add international date format support (#25) - thanks @godban

## [2.4.0](https://github.com/hypermodules/changelog-parser/compare/v2.3.0...v2.4.0) - 2018-02-13

### Features

- stringify results in CLI (#22) - thanks @benmonro

## [2.3.0](https://github.com/hypermodules/changelog-parser/compare/v2.2.0...v2.3.0) - 2018-01-09

### Features

- add support for parsed body (#20) (#21) - thanks @jrmykolyn

## [2.2.0](https://github.com/hypermodules/changelog-parser/compare/v2.1.0...v2.2.0) - 2017-12-29

### Features

- add promise support (#18) (#19) - thanks @jrmykolyn

## [2.1.0](https://github.com/hypermodules/changelog-parser/compare/v2.0.5...v2.1.0) - 2017-12-12

### Features

- add date to version objects; update tests. (#6) (#15) - thanks @jrmykolyn

### Chores

- add release script

## [2.0.5](https://github.com/hypermodules/changelog-parser/compare/v2.0.4...v2.0.5) - 2017-06-28

### Changes

- chore(ci): add 8, drop .10 & .12
- docs(readme): move badges out of title
- lint: fix useless escapes
- chore(pkg): bump to latest standard
- chore(gitignore): ignore lock files
- docs(readme): update repo web address

## [2.0.4](https://github.com/hypermodules/changelog-parser/compare/v2.0.3...v2.0.4)

### Fixes

- reset log & current vars after each execution (#10)

## [2.0.3](https://github.com/hypermodules/changelog-parser/compare/v2.0.2...v2.0.3) - 2016-09-09

- bump dev dependencies
- update repo URL
- update maintainer email

## [2.0.2](https://github.com/hypermodules/changelog-parser/compare/v2.0.1...v2.0.2) - 2015-06-15

- readme updates
- change log fix
- add keywords to package.json

## [2.0.1](https://github.com/hypermodules/changelog-parser/compare/v2.0.0...v2.0.1) - 2015-06-07

### Changes

- use `os` module to support cross-platform EOL parsing ([#4](https://github.com/hypermodules/changelog-parser/pull/4))

## [2.0.0](https://github.com/hypermodules/changelog-parser/compare/v1.1.0...v2.0.0) - 2015-04-02

### Breaking Changes

- `version` key of version object is now `null` unless semver found

### Changes

- parse out `v` prefix for version numbers ([gh-release#23](https://github.com/hypermodules/gh-release/issues/23))

### Additions

- add `title` key to version object
- add a real test

## [1.1.0](https://github.com/hypermodules/changelog-parser/compare/v1.0.1...v1.1.0) - 2015-03-07

- add cli support
- remove `description` key if empty
- add `CONTRIBUTING.md`
- add node 0.10 to travis-ci testing environments

## [1.0.1](https://github.com/hypermodules/changelog-parser/compare/v1.0.0...v1.0.1) - 2015-03-02

- fix readme example for [paulcpederson](http://github.com/paulcpederson/)

## 1.0.0 - 2015-03-02
- init
