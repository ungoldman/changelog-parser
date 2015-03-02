var parseChangelog = require('..')

parseChangelog(__dirname + '/CHANGELOG.md', function (err, result) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(result)
  process.exit(0)
})
