describe('i18n tags', function() {
  beforeEach(function (done) {
    browser.url('/index.html', done);
  });

  it('should render the bundle message with variable replacement', function () {
    const text = browser.getText('p[data-tag="common.helloWorld"]');
    expect(text).toEqual('Hello, John!');
  });

  it('should render update the bundle message on click 1', function () {
    browser.click('#a_clicked');
    const text = browser.getText('#a_clicked');
    expect(text).toEqual('Click 1');
  });

  it('should render update the bundle message on click 1', function () {
    browser.click('#btn_clicked');
    const text = browser.getText('#btn_clicked');
    expect(text).toEqual('Click 1');
  });

  it('should fallback if message not found in a bundle', function () {
    const text = browser.getText('p[data-tag="common.nonexistentMessage"]');
    expect(text).toEqual('message does not exist');
  });

  it('should fallback if bundle is not found', function () {
    const text = browser.getText('p[data-tag="contact.email"]');
    expect(text).toEqual('bundle does not exist');
  });
});
