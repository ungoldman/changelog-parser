var parseChangelog = require('..')

parseChangelog(__dirname + '/CHANGELOG.md', function (err, result) {
  if (err) throw err

  console.log(result)
})
