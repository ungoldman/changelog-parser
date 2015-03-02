var lineReader = require('line-reader')
var semver = /\[?([\w\d\.-]+\.[\w\d\.-]+[a-zA-Z0-9])\]?/
var log = { versions: [] }
var current

module.exports = function parse (file, callback) {
  lineReader.eachLine(file, handleLine).then(function () {
    // push last version into log
    pushCurrent()

    // clean up description
    log.description = clean(log.description)

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
    if (current && current.version) pushCurrent()

    current = versionFactory()

    if (semver.exec(line)) current.version = semver.exec(line)[1]
    else current.version = line.substring(2).trim()

    return
  }

  // deal with body or description content
  if (current) {
    current.body += line + '\n'
  } else {
    log.description = (log.description || '') + line + '\n'
  }
}

function versionFactory () {
  return {
    version: null,
    body: ''
  }
}

function pushCurrent () {
  current.body = clean(current.body)
  log.versions.push(current)
}

function clean (str) {
  if (!str) return ''

  // remove leading newlines
  str = str.replace(/^[\n]*/, '')
  // remove trailing newlines
  str = str.replace(/[\n]*$/, '')

  return str
}
