#!/usr/bin/env node

var parseChangelog = require('..')
var file = process.argv[2] || 'CHANGELOG.md'
var help = process.argv[2] === '-h' || process.argv[2] === '--help'

if (help) {
  console.log('usage: changelog-parser [filename]')
  process.exit(0)
}

parseChangelog(file, function (err, result) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(JSON.stringify(result))
})
