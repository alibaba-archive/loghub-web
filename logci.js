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
    logOptions = {
      url: '',
      token: '',
      slient: {},
      report: {}
    };

  function noop() {}

  function isObject(obj) {
    return typeof obj === 'object';
  }

  function isFunction(fn) {
    return typeof fn === 'function';
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

  function report(type, messages) {
    if (logOptions.url && logOptions.token) {
      logci.log(type, messages);  //TODO
    }
  }

  function logci(fn) {
    if (isFunction(fn)) {
      try {
        fn();
      } catch (error) {
        report('error', error);
      }
    }
  }

  var _console = console || {},
    _slient = logOptions.slient,
    _report = logOptions.report;

  logci.config = function (options) {
    if (isObject(options)) {
      logOptions.url = options.url || logOptions.url;
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
  };

  each(['log', 'info', 'warn', 'error'], function (method) {
    _console[method] = isFunction(_console[method]) ? _console[method] : noop;
    _slient[method] = false;
    _report[method] = false;
    logci[method] = function () {
      var args = [].slice.call(arguments);
      if (!_slient[method]) {
        _console[method].apply(_console, args);
      }
      if (_report[method]) {
        report(method, args);
      }
    };
  });
  _report.error = true;

  if (typeof module === 'object' && module.exports) {
    module.exports = logci();
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return logci;
    });
  }
  if (typeof window === 'object') {
    window.logci = logci;
  }
})();
