'use strict';
/*global module, require, Error, define, console*/
/*
 * logci - https://github.com/zensh/logci
 *
 * Licensed under the MIT license.
 */

(function () {
  var hasOwn = Object.prototype.hasOwnProperty,
    _console = console || {},
    _slient = {},
    _report = {},
    _request = noop,
    _options = {
      host: 'logci.com',
      bucket: '',
      token: '',
      slient: _slient,
      report: _report
    };

  function noop() {}
  function isObject(obj) {
    return typeof obj === 'object';
  }
  function isFunction(fn) {
    return typeof fn === 'function';
  }
  function isString(str) {
    return typeof str === 'string';
  }
  function isDefined(obj) {
    return typeof obj !== 'undefined';
  }

  /**
   * simple `each` function for object or array.
   *
   * @param {Object|Array} obj Object to iterate over.
   * @param {Function} iterator Iterator function.
   * @param {Object=} context Object to become context (`this`) for the iterator function.
   * @return {Object|Array} Reference to `obj`.
   * @api private
   */
  function each(obj, iterator, context) {
    for (var key in obj) {
      if (hasOwn.call(obj, key)) {
        iterator.call(context, obj[key], key, obj);
      }
    }
    return obj;
  }

  /**
   * Merge options to `_options`.
   *
   * @param {Object} options
   * @api private
   */
  function setOptions(options) {
    _options.host = options.host || _options.host;
    _options.bucket = options.bucket || _options.bucket;
    _options.token = options.token || _options.token;
    _options.reportHook = options.reportHook || _options.reportHook;
    if (isFunction(options.request)) {
      _options.request = options.request;
    }
    if (isObject(options.slient)) {
      each(_slient, function (value, key) {
        value = options.slient[key];
        if (isDefined(value)) {
          _slient[key] = value;
        }
      });
    }
    if (isObject(options.report)) {
      each(_report, function (value, key) {
        value = options.report[key];
        if (isDefined(value)) {
          _report[key] = value;
        }
      });
    }
  }

  /**
   * Format `log` to JSON string.
   *
   * @param {*} log
   * @param {String} tag, tag of log
   * @return {String}
   * @api private
   */
  function toJSON(log, tag) {
    if (log) {
      if (!isObject(log)) {
        log = new Error(log);
      }
      if (log instanceof Error) {
        log.name = log.name;
        log.message = log.message;
        log.stack = log.stack || log.description;
        delete log.domain;
      }
      log.tag = tag;
      try {
        log = JSON.stringify(log);
      } catch (e) {}
    }
    return isString(log) ? log : '';
  }

  /**
   * generate a request URL.
   *
   * @param {String} log, log to report
   * @return {String}
   * @api private
   */
  function toURL(log) {
    var url = '';
    if (log && _options.bucket && _options.token) {
      url += document && 'https:' === document.location.protocol ? 'https://' : 'http://';
      url += _options.host + '/ci?bucket=' + _options.bucket + '&token=' + _options.token;
      url += '&log=' + encodeURIComponent(log);
    }
    return url;
  }

  /**
   * request funciton for browser.
   *
   * @param {String} url, url contained log
   * @api private
   */
  function browser_request(url) {
    var img = new Image();
    img.onload = img.onerror = img.abort = function () {
      img = img.onload = img.onerror = img.abort = null;
    };
    img.src = url;
  }

  /**
   * report log to server.
   *
   * @param {*} log
   * @param {String} tag
   * @api private
   */
  function report(log, tag) {
    if (isFunction(_options.reportHook)) {
      log = _options.reportHook(log, tag);
    }
    log = toURL(toJSON(log, tag));
    if (log) {
      (_options.request || _request)(log);
    }
  }

  /**
   * main function.
   *
   * @param {Function|Object} if obj is a function, run it in try catch,
   * if obj is a object, it will be merge as options
   * @api public
   */
  function logci(obj) {
    if (isFunction(obj)) {
      try {
        obj();
      } catch (err) {
        logci.error(err);
      }
    } else if (isObject(obj)) {
      setOptions(obj);
    }
  }

  /**
   * generate logci.log, logci.info, logci.warn, logci.error, and set default options.
   *
   */
  each(['log', 'info', 'warn', 'error'], function (method) {
    _console[method] = isFunction(_console[method]) ? _console[method] : noop;
    _slient[method] = false;
    _report[method] = false;
    logci[method] = function () {
      if (!_slient[method]) {
        _console[method].apply(_console, arguments);
      }
      if (_report[method]) {
        report(arguments[0], isString(arguments[1]) ? arguments[1] : method);
      }
    };
  });

  _slient.globalError = _report.globalError = false;

  if (typeof window === 'object') {
    _request = browser_request;
    window.logci = logci;
    window.onerror = function (message, url, line, col, error) {
      if (_report.globalError) {
        report(error || {
          name: (message.match(/\b([A-Z]){1}\w+Error|\bError/) || [])[0] || message,
          message: message,
          stack: message + '\n    at '+ url + ':' + line
        }, 'globalError');
      }
      return _slient.globalError;
    };
  }
  if (typeof module === 'object' && module.exports) {
    _request = require('./lib/node_request.js'); // node server request
    module.exports = logci;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {return logci;});
  }
})();
