
describe('i18n library functions', function() {
  it('should parse locale key', function() {
    expect(i18n._parseLocaleKey('common')[0]).toEqual('common');
    expect(i18n._parseLocaleKey('common.hello')[0]).toEqual('common');
  });
});
