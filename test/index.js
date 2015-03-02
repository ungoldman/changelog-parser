var fs = require('fs')
var changelogic = require('..')
var testLog = fs.readFileSync(__dirname + '/CHANGELOG.md', {
  encoding: 'utf-8'
})

console.log(changelogic(__dirname + '/CHANGELOG.md'))
