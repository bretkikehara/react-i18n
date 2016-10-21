
describe('i18n library functions', function() {
  var i18n = window.i18n.default;

  i18n.loadBundlesSync('en-US', {
    common: {
      hello: 'Hello, {name}!',
    },
  });

  it('should parse locale key', function() {
    expect(i18n.parseLocaleKey('common')[0]).toEqual('common');
    expect(i18n.parseLocaleKey('common.hello')[0]).toEqual('common');
  });

  it('should interop message', function() {
    expect(i18n.renderI18n('common.hello', {
      name: 'World',
    })).toEqual('Hello, World!');
  });
});
