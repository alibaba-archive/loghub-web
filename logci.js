'use strict';
/*global module, require, Error, define, console*/
/*
 * logci - https://github.com/zensh/logci
 *
 * Copyright (c) 2013 Yan Qing
 * Licensed under the MIT license.
 */

(function () {
  var hasOwn = Object.prototype.hasOwnProperty,
    HOST = 'logci.com',
    _console = console || {},
    _slient = {},
    _report = {},
    logOptions = {
      space: '',
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
    logOptions.space = options.space || logOptions.space;
    logOptions.token = options.token || logOptions.token;
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

  function toJSON(err, logType) {
    if (err) {
      if (!isObject(err)) {
        err = new Error(err);
        err.name = 'LogCI';
      }
      if (err instanceof Error) {
        err.name = err.name;
        err.message = err.message;
        err.stack = err.stack || err.description;
        delete err.domain;
      }
      err.logType = logType;
      try {
        err = JSON.stringify(err);
      } catch (e) {}
      return isString(err) ? err : '';
    }
  }

  function toURL(params) {
    var url = '';
    if (params && logOptions.space && logOptions.token) {
      url += document && 'https:' === document.location.protocol ? 'https://' : 'http://';
      url += HOST + '/' + logOptions.space;
      url += '?token=' + logOptions.token;
      url += '&log=' + encodeURIComponent(params);
    }
    return url;
  }

  function request(url) { // bowers request
    if (Image) {
      var img = new Image();
      img.onload = img.onerror = img.abort = function () {
        img = img.onload = img.onerror = img.abort = null;
      };
      img.src = url;
    }
  }

  function report(err, type) {
    err = toJSON(err, type);
    if (err) {
      request(toURL(err));
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

  _slient.globalError = false;
  _report.globalError = false;

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
          name: message.match(/\b([A-Z]){1}\w+Error/)[0] || message,
          message: message,
          stack: message + '\n    at '+ url + ':' + line
        }, 'globalError');
      }
      return _slient.globalError;
    };
  }
})();
