
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    browserSync = require('browser-sync').create(),
    browserSyncCfg = require(`./conf/browserSyncCfg`),
    rollup = require('rollup-stream'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babel = require('rollup-plugin-babel'),
    ngrok = require('ngrok'),
    isDev = false,
    ngrokTunnel;

function rollupErrorHandler(error) {
  $.util.log($.util.colors.red(`Error (${ error.plugin }):\n${ error.message }\n`));
  if (isDev) {
    this.emit('end');
  } else {
    process.exit(1);
  }
}

function noop() {}

function server(opts, cb) {
  const initOpts = {};
  [].concat(Object.keys(browserSyncCfg), Object.keys(opts)).forEach(function (key) {
    const value = typeof opts[key] !== 'undefined' ? opts[key] : browserSyncCfg[key];
    if (typeof value !== 'undefined') {
      initOpts[key] = value;
    }
  });
  $.util.log('Starting server and proxy');
  browserSync.init(initOpts, function () {
    $.util.log('Server started');
    (cb || noop)();
  });
}

gulp.task('proxy', function (done) {
  $.util.log('Starting proxy');
  ngrok.connect({
    proto: 'http',
    addr: 7100,
  }, function (err, url) {
    if (err) {
      $.util.log($.util.colors.red(`FAiled to start proxy\n${ err }`));
    } else {
      ngrokTunnel = url;
      $.util.log(`Proxy available at: ${ url }`);
      done();
    }
  })
});

gulp.task('build', function() {
  return rollup({
    entry: './src/index.js',
    format: 'umd',
    moduleName: 'i18n',
    plugins: [
      babel({
        exclude: 'node_modules/**'
      })
    ],
    globals: {
      react: 'React',
      'node-fetch': 'fetch',
    }
  })
  .on('error', rollupErrorHandler)
  .pipe(source('react-i18n.js'))
  .pipe(gulp.dest('./dist'))
  .pipe(buffer())
  .pipe($.uglify())
  .pipe($.rename('react-i18n.min.js'))
  .pipe(gulp.dest('./dist'));
});

gulp.task('examples:build', function() {
  return rollup({
    entry: './examples/index.jsx',
    // amd, cjs, es, iife, umd
    format: 'umd',
    plugins: [
      babel({
        // exclude: 'node_modules/**'
      }),
    ],
    globals: {
      'whatwg-fetch': 'fetch',
      react: 'React',
      'react-dom': 'ReactDOM',
      'node-fetch': 'fetch',
    }
  })
  .on('error', rollupErrorHandler)
  .pipe(source('index.js'))
  .pipe(gulp.dest('./tmp'));
});

gulp.task('examples:copy', function() {
  return gulp.src([
    'examples/*.html',
    'examples/**/*.lang.json',
  ])
  .pipe(gulp.dest('tmp'));
});

gulp.task('examples', ['examples:build', 'examples:copy']);

gulp.task('server', [ 'examples' ], function () {
  server({
    port: process.env.PORT,
    open: false,
  });
});

gulp.task('dev', [ 'examples' ], function() {
  isDev = true;
  server({
    port: process.env.PORT,
  });

  gulp.watch([
    "src/*.js",
    "examples/*.jsx"
  ], [
    'examples'
  ]).on("change", function () {
    $.util.log('Rebuilt examples');
    browserSync.reload();
  });
});

gulp.task('test:e2e:server', function (done) {
  server({
    port: process.env.PORT,
    open: false,
  }, function () {
    done();
  });
})

gulp.task('test:e2e', ['proxy', 'test:e2e:server'], function() {
  $.util.log('Running test:e2e');
  let error = false;

  return gulp
    .src('conf/wdio.js')
    .pipe($.webdriver({
      baseUrl: ngrokTunnel,
    }))
    .on('error', function (error) {
      $.util.log($.util.colors.red(`Error (${ error.plugin }):\n${ error.message }\n`));
      error = true;
      this.emit('end');
    })
    .on('end', function (error) {
      $.util.log('Killing ngrok', ngrokTunnel);
      ngrok.disconnect(ngrokTunnel);
      ngrok.kill();
      $.util.log('Killing browserSync');
      browserSync.exit();
      setTimeout(function () {
        process.exit(error ? 1 : 0);
      }, 5000);
    });
});
