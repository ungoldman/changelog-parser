var EOL = require('os').EOL
var lineReader = require('line-reader')
var semver = /\[?v?([\w\d.-]+\.[\w\d.-]+[a-zA-Z0-9])\]?/
var date = /.*([\d]{4}-[\d]{2}-[\d]{2}).*/
var log
var current

function parseChangelog (file, callback) {
  // return a Promise if invoked without a `callback`
  if (!callback || typeof callback !== 'function') {
    return doParse(file)
  }

  // otherwise, parse log and invoke callback
  doParse(file).then(function (log) {
    callback(null, log)
  })
}

function doParse (file) {
  log = { versions: [] }
  current = null

  return new Promise(function (resolve, reject) {
    lineReader.eachLine(file, handleLine, EOL).then(function () {
      // push last version into log
      pushCurrent()

      // clean up description
      log.description = clean(log.description)
      if (log.description === '') delete log.description

      resolve(log)
    })
  })
}

function handleLine (line) {
  // skip line if it's a link label
  if (line.match(/^\[[^[\]]*\] *?:/)) return

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

    if (current.title && date.exec(current.title)) current.date = date.exec(current.title)[1]

    return
  }

  // deal with body or description content
  if (current) {
    current.body += line + EOL
  } else {
    log.description = (log.description || '') + line + EOL
  }
}

function versionFactory () {
  return {
    version: null,
    title: null,
    date: null,
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
  str = str.replace(new RegExp('[' + EOL + ']*'), '')
  // remove trailing newlines
  str = str.replace(new RegExp('[' + EOL + ']*$'), '')

  return str
}

module.exports = parseChangelog
