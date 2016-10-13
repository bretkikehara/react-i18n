// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['jasmine'],
    browsers : ['PhantomJS'],
    singleRun: true,
    files: [
      '../node_modules/babel-polyfill/dist/polyfill.js',
      '../node_modules/whatwg-fetch/fetch.js',
      '../node_modules/react/dist/react.js',
      '../node_modules/react-dom/dist/react-dom.js',
      '../node_modules/react/dist/react-with-addons.js',
      '../dist/react-i18n.js',
      '../tests/unit/**/*.js',
    ],
  });
};
