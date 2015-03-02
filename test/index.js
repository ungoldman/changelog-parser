var changelogic = require('..')

changelogic(__dirname + '/CHANGELOG.md', function (err, result) {
  if (err) throw err

  console.log(result)
})
