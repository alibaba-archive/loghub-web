'use strict';
/*global module*/
/*
 * logci - https://github.com/zensh/logci
 *
 * Copyright (c) 2013 Yan Qing
 * Licensed under the MIT license.
 */

var http = require('http');

module.exports = function (url) {
  if (url) {
    http.get(url, function (res) {});
  }
};