
var webdriverio = require('webdriverio');
var client = webdriverio.remote();

var assert = require('assert');
describe('i18n tags', function() {
  it('should render the bundle message with variable replacement', function () {
    client.init()
      .url('http://localhost:7100/')
      .getText('p[data-tag="common.helloWorld"]')
      .then(function(text) {
          assert.equal(text, 'Hello, John!');
      })
      .end();
  });
});
