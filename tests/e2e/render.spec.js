
var webdriverio = require('webdriverio');
var client = webdriverio.remote();

var expect = require('jasmine');
describe('i18n tags', function() {
  it('should render the bundle message with variable replacement', function () {
    client.init()
      .url('http://localhost:7100/')
      .getText('p[data-tag="common.helloWorld"]')
      .then(function(text) {
          expect(text).toEqual('Hello, John!');
      })
      .end();
  });
});
