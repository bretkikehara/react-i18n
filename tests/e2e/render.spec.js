
var webdriverio = require('webdriverio');
var client = webdriverio.remote();

var expect = require('jasmine');

describe('i18n tags', function() {
  it('should render the bundle message with variable replacement', function () {
    client.init()
      .url('http://localhost:7100/')
      .getText('p[data-tag="common.helloWorld"]').then(function(text) {
          expect(text).toEqual('Hello, John!');
      })
      .end();
  });

  it('should render update the bundle message on click', function () {
    client.init()
      .url('http://localhost:7100/')
      .click('#a_clicked')
      .getText('#a_clicked').then(function(value) {
          expect(value).toEqual('Click 1');
      })
      .click('#btn_clicked')
      .getText('#btn_clicked').then(function(value) {
          expect(value).toEqual('Click 2');
      })
      .end();
  });
});
