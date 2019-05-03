var EOL = require('os').EOL
var lineReader = require('line-reader')
var removeMarkdown = require('remove-markdown')

// patterns
var semver = /\[?v?([\w\d.-]+\.[\w\d.-]+[a-zA-Z0-9])\]?/
var date = /.*[ ](\d\d?\d?\d?[-/.]\d\d?[-/.]\d\d?\d?\d?).*/
var subhead = /^###/
var listitem = /^[*-]/

var defaultOptions = { removeMarkdown: true }

/**
 * Changelog parser.
 *
 * @param {string|object} options - changelog file string or options object containing file string
 * @param {string} [options.filePath] - path to changelog file
 * @param {string} [options.text] - changelog text (filePath alternative)
 * @param {boolean} [options.removeMarkdown=true] - changelog file string to parse
 * @param {function} [callback] - optional callback
 * @returns {Promise<object>} - parsed changelog object
 */
function parseChangelog (options, callback) {
  if (typeof options === 'undefined') throw new Error('missing options argument')
  if (typeof options === 'string') options = { filePath: options }
  if (typeof options === 'object') {
    var hasFilePath = typeof options.filePath !== 'undefined'
    var hasText = typeof options.text !== 'undefined'
    var invalidFilePath = typeof options.filePath !== 'string'
    var invalidText = typeof options.text !== 'string'

    if (!hasFilePath && !hasText) {
      throw new Error('must provide filePath or text')
    }

    if (hasFilePath && invalidFilePath) {
      throw new Error('invalid filePath, expected string')
    }

    if (hasText && invalidText) {
      throw new Error('invalid text, expected string')
    }
  }

  var opts = Object.assign({}, defaultOptions, options)
  var changelog = parse(opts)

  if (typeof callback === 'function') {
    changelog
      .then(function (log) { callback(null, log) })
      .catch(function (err) { callback(err) })
  }

  // otherwise, invoke callback
  return changelog
}

/**
 * Internal parsing logic.
 *
 * @param {options} options - options object
 * @param {string} [options.filePath] - path to changelog file
 * @param {string} [options.text] - changelog text (filePath alternative)
 * @param {boolean} [options.removeMarkdown] - remove markdown
 * @returns {Promise<object>} - parsed changelog object
 */
function parse (options) {
  var filePath = options.filePath
  var text = options.text
  var data = {
    log: { versions: [] },
    current: null
  }

  // allow `handleLine` to mutate log/current data as `this`.
  var cb = handleLine.bind(data, options)

  return new Promise(function (resolve, reject) {
    function done () {
      // push last version into log
      if (data.current) {
        pushCurrent(data)
      }

      // clean up description
      data.log.description = clean(data.log.description)
      if (data.log.description === '') delete data.log.description

      resolve(data.log)
    }

    if (text) {
      text.split(/\r\n?|\n/mg).forEach(cb)
      done()
    } else {
      lineReader.eachLine(filePath, cb, EOL).then(done)
    }
  })
}

/**
 * Handles each line and mutates data object (bound to `this`) as needed.
 *
 * @param {object} options - options object
 * @param {boolean} options.removeMarkdown - whether or not to remove markdown
 * @param {string} line - line from changelog file
 */
function handleLine (options, line) {
  // skip line if it's a link label
  if (line.match(/^\[[^[\]]*\] *?:/)) return

  // set title if it's there
  if (!this.log.title && line.match(/^# ?[^#]/)) {
    this.log.title = line.substring(1).trim()
    return
  }

  // new version found!
  if (line.match(/^##? ?[^#]/)) {
    if (this.current && this.current.title) pushCurrent(this)

    this.current = versionFactory()

    if (semver.exec(line)) this.current.version = semver.exec(line)[1]

    this.current.title = line.substring(2).trim()

    if (this.current.title && date.exec(this.current.title)) this.current.date = date.exec(this.current.title)[1]

    return
  }

  // deal with body or description content
  if (this.current) {
    this.current.body += line + EOL

    // handle case where current line is a 'subhead':
    // - 'handleize' subhead.
    // - add subhead to 'parsed' data if not already present.
    if (subhead.exec(line)) {
      var key = line.replace('###', '').trim()

      if (!this.current.parsed[key]) {
        this.current.parsed[key] = []
        this.current._private.activeSubhead = key
      }
    }

    // handle case where current line is a 'list item':
    if (listitem.exec(line)) {
      const log = options.removeMarkdown ? removeMarkdown(line) : line
      // add line to 'catch all' array
      this.current.parsed._.push(log)

      // add line to 'active subhead' if applicable (eg. 'Added', 'Changed', etc.)
      if (this.current._private.activeSubhead) {
        this.current.parsed[this.current._private.activeSubhead].push(log)
      }
    }
  } else {
    this.log.description = (this.log.description || '') + line + EOL
  }
}

function versionFactory () {
  return {
    version: null,
    title: null,
    date: null,
    body: '',
    parsed: {
      _: []
    },
    _private: {
      activeSubhead: null
    }
  }
}

function pushCurrent (data) {
  // remove private properties
  delete data.current._private

  data.current.body = clean(data.current.body)
  data.log.versions.push(data.current)
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
