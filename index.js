var lineReader = require('line-reader')
var semver = /\[?([\w\d\.-]+\.[\w\d\.-]+[a-zA-Z0-9])\]?/
var log = { versions: [] }
var current

module.exports = function parse (file, callback) {
  lineReader.eachLine(file, handleLine).then(function () {
    // push last version into log
    log.versions.push(current)
    callback(null, log)
  })
}

function handleLine (line) {
  // skip line if it's a link label
  if (line.match(/^\[[^\[\]]*\] *?:/)) return

  // set title if it's there
  if (!log.title && line.match(/^# ?[^#]/)) {
    log.title = line.substring(1).trim()
    return
  }

  // new version found!
  if (line.match(/^## ?[^#]/)) {
    if (current && current.version) log.versions.push(current)

    current = versionFactory()

    if (semver.exec(line)) current.version = semver.exec(line)[1]
    else current.version = line.substring(2).trim()

    return
  }

  if (current) {
    current.body = trimBody(current.body) + line + '\n'
  } else {
    log.description = trimBody(log.description) + line + '\n'
  }
}

function versionFactory () {
  return {
    version: null,
    body: ''
  }
}

function trimBody (body) {
  if (!body) return ''

  // get rid of leading newlines
  body = body.replace(/^[\n]*/, '')
  // reduce trailing newlines to one
  body = body.replace(/[\n]*$/, '\n')

  return body
}
