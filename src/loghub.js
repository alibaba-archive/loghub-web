// Copyright (c) 2013 Yan Qing
//               2015 Sunny
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

;(function (root, factory) {
  'use strict'
  if (typeof module === 'object' && module.exports) module.exports = factory()
  else if (typeof define === 'function' && define.amd) define([], factory)
  else root.loghub = factory()
})(typeof window === 'object' ? window : this, function () {
  'use strict'

  // Default config
  let _options = {
    token: '',
    host: 'logci.com/ci',
    request: null,
    reportHook: null,
    report: { log: true, error: true, globalError: true },
    slient: { log: false, error: false, globalError: false }
  }

  // Some helper
  let _isString = o => typeof o === 'string'
  let _isObject = o => typeof o === 'object' && !Array.isArray(o)
  let _isFunction = o => Object.prototype.toString.call(o) === '[object Function]'

  // Object recursive assignment
  let _setOptions = function (dest, src) {
    for (let key in src) {
      if (!(key in dest && Object.prototype.hasOwnProperty.call(src, key))) continue
      if (_isObject(src[key]) && _isObject(dest[key])) {
        _setOptions(dest[key], src[key])
      } else {
        dest[key] = src[key]
      }
    }
  }

  // Convert log and tag to standard format
  let _toJSON = function (log, tag) {
    if (log) {
      try {
        // To prevent log is a read-only object
        log = JSON.parse(JSON.stringify(log))
      } catch (e) {}
      if (!_isObject(log)) {
        log = new Error(log)
      }
      log.tag = tag
      try {
        log = JSON.stringify(log)
      } catch (e) {}
    }
    return _isString(log) ? log : ''
  }

  // Generate report URL
  let _toURL = function (log) {
    let url = ''
    if (log) {
      url += document.location.protocol === 'https:' ? 'https://' : 'http://'
      url += _options.host + '?log=' + encodeURIComponent(log)
      if (_options.token) {
        url += '&token=' + encodeURIComponent(_options.token)
      }
    }
    return url
  }

  // Send request
  let _request = function (url) {
    if (!url) { return }
    let img = new window.Image()
    img.onload = img.onerror = img.abort = function () {
      img = img.onload = img.onerror = img.abort = null
    }
    img.src = url
  }

  // Report other things
  let _report = function (log, tag) {
    if (_isFunction(_options.reportHook)) {
      log = _options.reportHook(log)
    }
    let url = _toURL(_toJSON(log, tag))
    if (url) {
      (_options.request || _request)(url)
    }
  }

  // loghub entry point
  let loghub = function (arg, ...args) {
    if (_isFunction(arg)) {
      try {
        arg.call(this, ...args)
      } catch (err) {
        loghub.error(err)
      }
    } else {
      _setOptions(_options, arg)
    }
  }

  // Register log functions
  ;['log', 'error'].forEach(function (method) {
    loghub[method] = function () {
      if (!_options.slient[method] && typeof console !== 'undefined') {
        console[method].apply(console, arguments)
      }
      if (_options.report[method]) {
        _report(arguments, method)
      }
    }
  })

  let _getPerformanceTiming = function (name) {
    if (typeof window === 'undefined') { return 0 }
    if ('performance' in window &&
        'timing' in window.performance && name in window.performance.timing) {
      return window.performance.timing[name]
    } else {
      return 0
    }
  }

  // Provide fetch start time
  loghub.timing = {
    domainLookupEnd: _getPerformanceTiming('domainLookupEnd'),
    domainLookupStart: _getPerformanceTiming('domainLookupStart'),
    connectEnd: _getPerformanceTiming('connectEnd'),
    connectStart: _getPerformanceTiming('connectStart'),
    requestStart: _getPerformanceTiming('requestStart'),
    responseEnd: _getPerformanceTiming('responseEnd'),
    responseStart: _getPerformanceTiming('responseStart')
  }

  // Provide current loaded entries timing info
  loghub.getEntries = function () {
    if (typeof window !== 'undefined' &&
        'performance' in window && 'getEntries' in window.performance) {
      let entries = window.performance.getEntries()
      return entries.map(function (entry) {
        return {
          'duration': entry.duration || 0,
          'entryType': entry.entryType || '',
          'initiatorType': entry.initiatorType || '',
          'name': entry.name || '',
          'startTime': entry.startTime || 0,
          'responseEnd': entry.responseEnd || 0
        }
      })
    } else {
      return []
    }
  }

  // Process global error
  if (_options.report.globalError) {
    window.addEventListener('error', function (msg, url, line, col, error) {
      _report(error || {
        name: (msg.match(/\b([A-Z]){1}\w+Error|\bError/) || [])[0] || msg,
        message: msg,
        stack: msg + '\n    at ' + url + ':' + line
      }, 'globalError')
    }, false)
  }

  return loghub
})
