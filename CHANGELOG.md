# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [2.0.5](https://github.com/ungoldman/changelog-parser/compare/v2.0.4...v2.0.5) - 2017-06-28

### Changes

- chore(ci): add 8, drop .10 & .12
- docs(readme): move badges out of title
- lint: fix useless escapes
- chore(pkg): bump to latest standard
- chore(gitignore): ignore lock files
- docs(readme): update repo web address

## [2.0.4](https://github.com/ungoldman/changelog-parser/compare/v2.0.3...v2.0.4)

### Fixes

- reset log & current vars after each execution (#10)

## [2.0.3](https://github.com/ungoldman/changelog-parser/compare/v2.0.2...v2.0.3) - 2016-09-09

- bump dev dependencies
- update repo URL
- update maintainer email

## [2.0.2](https://github.com/ungoldman/changelog-parser/compare/v2.0.1...v2.0.2) - 2015-06-15

- readme updates
- change log fix
- add keywords to package.json

## [2.0.1](https://github.com/ungoldman/changelog-parser/compare/v2.0.0...v2.0.1) - 2015-06-07

### Changes

- use `os` module to support cross-platform EOL parsing ([#4](https://github.com/ungoldman/changelog-parser/pull/4))

## [2.0.0](https://github.com/ungoldman/changelog-parser/compare/v1.1.0...v2.0.0) - 2015-04-02

### Breaking Changes

- `version` key of version object is now `null` unless semver found

### Changes

- parse out `v` prefix for version numbers ([ngoldman/gh-release#23](https://github.com/ungoldman/gh-release/issues/23))

### Additions

- add `title` key to version object
- add a real test

## [1.1.0](https://github.com/ungoldman/changelog-parser/compare/v1.0.1...v1.1.0) - 2015-03-07

- add cli support
- remove `description` key if empty
- add `CONTRIBUTING.md`
- add node 0.10 to travis-ci testing environments

## [1.0.1](https://github.com/ungoldman/changelog-parser/compare/v1.0.0...v1.0.1) - 2015-03-02

- fix readme example for [paulcpederson](http://github.com/paulcpederson/)

## 1.0.0 - 2015-03-02
- init
