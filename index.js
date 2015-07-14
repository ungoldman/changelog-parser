var endOfLine = require('os').EOL
var lineReader = require('line-reader')
var semver = /\[?v?([\w\d\.-]+\.[\w\d\.-]+[a-zA-Z0-9])\]?/
var log = { versions: [] }
var current

function parseChangelog (file, callback) {
  lineReader.eachLine(file, handleLine, endOfLine).then(function () {
    // push last version into log
    pushCurrent()

    // clean up description
    log.description = clean(log.description)
    if (log.description === '') delete log.description

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
    if (current && current.title) pushCurrent()

    current = versionFactory()

    if (semver.exec(line)) current.version = semver.exec(line)[1]

    current.title = line.substring(2).trim()

    return
  }

  // deal with body or description content
  if (current) {
    current.body += line + endOfLine
  } else {
    log.description = (log.description || '') + line + endOfLine
  }
}

function versionFactory () {
  return {
    version: null,
    title: null,
    body: ''
  }
}

function pushCurrent () {
  current.body = clean(current.body)
  log.versions.push(current)
}

function clean (str) {
  if (!str) return ''

  // trim
  str = str.trim()
  // remove leading newlines
  str = str.replace(new RegExp('[' + endOfLine + ']*'), '')
  // remove trailing newlines
  str = str.replace(new RegExp('[' + endOfLine + ']*$'), '')

  return str
}

module.exports = parseChangelog
