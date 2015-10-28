'use strict'

var http = require('http')
var sinon = require('sinon')
var should = require('should')

var loghub = require('../index.js')

describe('LogHub NodeJS API test', function () {
  var a = 123
  var b = { 'foo': 'bar' }
  var c = [ 'foobar' ]

  var httpStub = sinon.stub(http, 'get')

  it('should log into console and report by default', function () {
    var logStub = sinon.stub(console, 'log')
    loghub.log(a, b, c)
    should(logStub.withArgs(a, b, c).calledOnce).is.true
    should(httpStub.calledOnce).is.true
    logStub.restore()
  })

  it('should log error into console and report by default', function () {
    var errorStub = sinon.stub(console, 'error')
    loghub.error(a, b, c)
    should(errorStub.withArgs(a, b, c).calledOnce).is.true
    should(httpStub.calledOnce).is.true
    errorStub.restore()
  })

  it('should not log into console after supress flag is set and report', function () {
    var logStub = sinon.stub(console, 'log')
    loghub({ slient: { log: true } })
    loghub.log(a, b, c)
    should(logStub.called).is.false
    should(httpStub.calledOnce).is.true
    logStub.restore()
  })

  it('should not log error into console after supress flag is set and report', function () {
    var errorStub = sinon.stub(console, 'error')
    loghub({ slient: { error: true } })
    loghub.error(a, b, c)
    should(errorStub.called).is.false
    should(httpStub.calledOnce).is.true
    errorStub.restore()
  })

  it('should not report log after suppress flag is set and not log into console', function () {
    var logStub = sinon.stub(console, 'log')
    loghub({ report: { log: false } })
    loghub.log(a, b, c)
    should(logStub.called).is.false
    should(httpStub.called).is.false
    logStub.restore()
  })

  it('should not report error after suppress flag is set and not log into console', function () {
    var errorStub = sinon.stub(console, 'error')
    loghub({ report: { error: false } })
    loghub.error(a, b, c)
    should(errorStub.called).is.false
    should(httpStub.called).is.false
    errorStub.restore()
  })

  it('should not report but log into console after flag is set', function () {
    var logStub = sinon.stub(console, 'log')
    loghub({ slient: { log: false } })
    loghub.log(a, b, c)
    should(logStub.withArgs(a, b, c).calledOnce).is.true
    should(httpStub.called).is.false
    logStub.restore()
  })

  it('should not report but log error into console after flag is set', function () {
    var errorStub = sinon.stub(console, 'error')
    loghub({ slient: { error: false } })
    loghub.error(a, b, c)
    should(errorStub.withArgs(a, b, c).calledOnce).is.true
    should(httpStub.called).is.false
    errorStub.restore()
  })

  httpStub.restore()
})
