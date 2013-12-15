'use strict';
/*global module, define, console*/
/*
 * logci - https://github.com/zensh/logci
 *
 * Copyright (c) 2013 Yan Qing
 * Licensed under the MIT license.
 */

(function () {
  var hasOwn = Object.prototype.hasOwnProperty,
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

  function report(messages, type) {
    if (logOptions.space && logOptions.token) {
      _console.error(messages, type);  //TODO
    }
  }

  function logci(obj) {
    if (isFunction(obj)) {
      try {
        obj();
      } catch (error) {
        logci.error(err, 'error');
      }
    } else if (isObject(obj)) {
      setOptions(obj)
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
      if (_report[method] && arguments[0]) {
        report(arguments[0], isString(arguments[1]) ? arguments[1] : method);
      }
    };
  });
  _report.error = true;

  if (typeof module === 'object' && module.exports) {
    module.exports = logci;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return logci;
    });
  }
  if (typeof window === 'object') {
    window.logci = logci;
  }
})();
