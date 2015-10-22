'use strict';

var http = require('http');

module.exports = function (url) {
  if (url) {
    http.get(url, function (res) {});
  }
};
