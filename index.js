module.exports = function parse (file) {
  var changelog = {}
  var versions = getVersions(file)

  versions.forEach(function (v) {
    changelog[v] = getBody(v)
  })

  return changelog
}

function getVersions (string) {
  var matches = []
  var regex = /#{1,3} ?\[?v?([\w\d\.-]+\.[\w\d\.-]+[a-zA-Z0-9])\]?/gi

  var match = regex.exec(string)

  while (match) {
    matches.push(match[1])
    match = regex.exec(string)
  }

  return matches
}

function getBody (version) {
  return 'asdasdas'
}
