
describe('i18n library functions', function() {
  var i18n = window.i18n.default;
  it('should parse locale key', function() {
    expect(i18n.parseLocaleKey('common')[0]).toEqual('common');
    expect(i18n.parseLocaleKey('common.hello')[0]).toEqual('common');
  });
});
