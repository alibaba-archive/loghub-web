"use strict";
/* global logci, describe, it, expect, jasmine, spyOn */

describe("LogCI from a global <script> tag", function () {
  var a = {}, b = [];

  it("logci is available globally", function () {
    expect(logci).toEqual(jasmine.any(Function));
  });

  it("successfully log", function () {
    spyOn(console, 'log');
    logci.log(123, a, b);
    expect(console.log).toHaveBeenCalledWith(123, a, b);
  });

  it("successfully info", function () {
    spyOn(console, 'info');
    logci.info(123, a, b);
    expect(console.info).toHaveBeenCalledWith(123, a, b);
  });

  it("successfully warn", function () {
    spyOn(console, 'warn');
    logci.warn(123, a, b);
    expect(console.warn).toHaveBeenCalledWith(123, a, b);
  });

  it("successfully error", function () {
    spyOn(console, 'error');
    logci.error(123, a, b);
    expect(console.error).toHaveBeenCalledWith(123, a, b);
  });

  it("successfully catch error", function () {
    var err = new Error('It is a error!');
    spyOn(console, 'error');
    expect(function () {
      logci(function () {
        throw err;
      });
    }).not.toThrow();
    expect(console.error).toHaveBeenCalledWith(err);
  });

  it("set options", function () {
    logci({
      slient:{
        log: true,
        info: true,
        warn: true,
        error: true
      }
    });
  });

  it("slient log", function () {
    spyOn(console, 'log');
    logci.log(123, a, b);
    expect(console.log).not.toHaveBeenCalled();
  });

  it("slient info", function () {
    spyOn(console, 'info');
    logci.info(123, a, b);
    expect(console.info).not.toHaveBeenCalled();
  });

  it("slient warn", function () {
    spyOn(console, 'warn');
    logci.warn(123, a, b);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("slient error", function () {
    spyOn(console, 'error');
    logci.error(123, a, b);
    expect(console.error).not.toHaveBeenCalled();
  });

});