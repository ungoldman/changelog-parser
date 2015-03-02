var marked = require('marked')
var toMarkdown = require('to-markdown').toMarkdown
var cheerio = require('cheerio')
var regex = /\[?([\w\d\.-]+\.[\w\d\.-]+[a-zA-Z0-9])\]? .*?(\d{4}-\d{2}-\d{2}|\w+)/
var $

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  smartLists: true
})

module.exports = function parse (file) {
  $ = cheerio.load(marked(file))

  return {
    title: getTitle(),
    versions: getVersions()
  }
}

function getTitle () {
  return $('h1').text()
}

function getVersions () {
  var arr = []

  var versions = $('h2').filter(function () {
    return regex.test($(this).text())
  })

  versions.each(function () {
    arr.push({
      version: $(this).text(),
      body: toMarkdown($(this).nextUntil('h2').html())
    })
  })

  return arr
}
