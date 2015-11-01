// Copyright (c) 2015 Teambition
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/* global module, define */
;(function (root, factory) {
  'use strict'

  var loghub = factory(root)
  if (typeof module === 'object' && module.exports) module.exports = loghub
  else if (typeof define === 'function' && define.amd) define([], function () { return loghub })
  else root.loghub = loghub
})(typeof window === 'object' ? window : (this || {}), function (root) {
  'use strict'

  // Some helper
  var toStr = Object.prototype.toString
  var hasOwn = Object.prototype.hasOwnProperty
  var protocol = 'http://'

  if (root.document && root.document.location.protocol === 'https:') protocol = 'https://'

  // global config
  var _options = {
    host: '',     // logs.teambition.net/log.gif
    token: '',
    request: null,
    logHook: null,
    report: {log: true, error: true, globalError: true},
    slient: {log: false, error: false}
  }

  // loghub entry point
  function loghub (options) {
    if (isObject(options)) setOptions(_options, options)
    // Process global error
    if ('onerror' in root) {
      root.onerror = _options.report.globalError ? function (msg, url, line, col, error) {
        loghub.error(error || {
          name: (msg.match(/\b([A-Z]){1}\w+Error|\bError/) || [])[0] || 'Error',
          message: msg,
          stack: msg + '\n    at ' + url + ':' + line
        }, 'globalError')
      } : null
    }
    return loghub
  }

  // Provide fetch start time
  loghub.timing = {
    fetchStart: getPerformanceTiming('fetchStart'),
    domainLookupStart: getPerformanceTiming('domainLookupStart'),
    domainLookupEnd: getPerformanceTiming('domainLookupEnd'),
    connectStart: getPerformanceTiming('connectStart'),
    connectEnd: getPerformanceTiming('connectEnd'),
    requestStart: getPerformanceTiming('requestStart'),
    responseStart: getPerformanceTiming('responseStart'),
    responseEnd: getPerformanceTiming('responseEnd'),
    startTime: new Date().getTime()
  }

  loghub.log = function (log) {
    if (!_options.slient.log) console.log(log)
    if (_options.report.log) report(log)
  }

  loghub.error = function (log) {
    if (!_options.slient.error) console.error(log)
    if (_options.report.error) report(errorify(log), 'error')
  }

  // Provide current loaded entries timing info
  loghub.getEntries = function () {
    var res = []
    if (root.performance && isFunction(root.performance.getEntries)) {
      var entries = root.performance.getEntries()
      for (var i = 0; i < entries.length; i++) {
        res.push({
          'name': entries[i].name || '',
          'entryType': entries[i].entryType || '',
          'initiatorType': entries[i].initiatorType || '',
          'startTime': Math.round(entries[i].startTime || 0),
          'duration': Math.round(entries[i].duration || 0)
        })
      }
    }
    return res
  }

  function getPerformanceTiming (name) {
    if (!root.performance || !root.performance.timing) { return 0 }
    return Math.floor(root.performance.timing[name] || 0)
  }

  function isString (str) {
    return typeof str === 'string'
  }

  function isObject (obj) {
    return toStr.call(obj) === '[object Object]'
  }

  function isFunction (fn) {
    return toStr.call(fn) === '[object Function]'
  }

  // Object recursive assignment
  function setOptions (dest, src) {
    for (var key in src) {
      if (!hasOwn.call(dest, key)) continue
      if (isObject(src[key]) && isObject(dest[key])) {
        setOptions(dest[key], src[key])
      } else {
        dest[key] = src[key]
      }
    }
  }

  // Convert log and tag to standard format
  function toJSON (log, tag) {
    if (isObject(log)) {
      if (isString(tag)) log.tag = tag
      try {
        log = JSON.stringify(log)
      } catch (e) {
        log = JSON.stringify(errorify(e))
      }
    }
    return isString(log) ? log : ''
  }

  // Generate report URL
  function toURL (log) {
    if (!log || !_options.host) return ''
    var url = protocol
    url += _options.host + '?log=' + encodeURIComponent(log)
    if (_options.token) {
      url += '&token=' + encodeURIComponent(_options.token)
    }
    return url
  }

  // Send request
  var idCount = 0
  loghub._requests = {}

  function request (payload) {
    if (!payload || !root.Image) return
    var id = ++idCount
    if (id > 2e10) idCount = 0

    var img = loghub._requests[id] = new root.Image()
    img.onload = img.onerror = img.abort = function () {
      img = img.onload = img.onerror = img.abort = null
      delete loghub._requests[id]
    }
    img.src = payload
  }

  // Report other things
  function report (log, tag) {
    if (!isFunction(_options.logHook)) log = toJSON(log, tag)
    else log = _options.logHook(log, tag)

    if (!log) return
    if (!isFunction(_options.request)) request(toURL(log))
    else _options.request(protocol + _options.host, log)
  }

  function errorify (err) {
    if (!err) return
    return {
      name: err.name || 'Error',
      message: err.message || String(err),
      stack: err.stack || null
    }
  }

  return loghub()
})
