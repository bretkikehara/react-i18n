const browserSync = require('browser-sync').create(),
      browserSyncCfg = require(`${ __dirname }/browserSyncCfg`);

module.exports = {
  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  //
  // Gets executed once before all workers get launched.
  onPrepare: function (config, capabilities) {
    browserSync.init(Object.assign(browserSyncCfg, {
      port: 7123,
      open: false,
    }));
  },
  // Gets executed after all workers got shut down and the process is about to exit. It is not
  // possible to defer the end of the process using a promise.
  onComplete: function(exitCode) {
    browserSync.exit();
  }
};
