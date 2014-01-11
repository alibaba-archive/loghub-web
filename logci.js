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
  function each(obj, iterator, context) {
    for (var key in obj) {
      if (hasOwn.call(obj, key)) {
        iterator.call(context, obj[key], key, obj);
      }
    }
  }

  function setOptions(options) {
    _options.host = options.host || _options.host;
    _options.bucket = options.bucket || _options.bucket;
    _options.token = options.token || _options.token;
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
      return isString(log) ? log : '';
    }
  }

  function toURL(params) {
    var url = '';
    if (params && _options.bucket && _options.token) {
      url += document && 'https:' === document.location.protocol ? 'https://' : 'http://';
      url += _options.host + '/?bucket=' + _options.bucket + '&token=' + _options.token;
      url += '&log=' + encodeURIComponent(params);
    }
    return url;
  }

  function request(url) { // request for bowers
    if (Image) {
      var img = new Image();
      img.onload = img.onerror = img.abort = function () {
        img = img.onload = img.onerror = img.abort = null;
      };
      img.src = url;
    }
  }

  function report(log, tag) {
    log = toJSON(log, tag);
    if (log) {
      (_options.request || request)(toURL(log));
    }
  }

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

  if (typeof module === 'object' && module.exports) {
    request = require('./lib/node_request.js'); // node server request
    module.exports = logci;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {return logci;});
  }
  if (typeof window === 'object') {
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
})();
