
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
      rename: {
        'gulp-tag-version': 'gitTag',
        'gulp-git-push': 'gitPush',
      }
    }),
    browserSync = require('browser-sync').create(),
    rollupStream = require('rollup-stream'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babel = require('rollup-plugin-babel'),
    ngrok = require('ngrok'),
    Karma = require('karma').Server,
    isDev = false,
    SERVER_PORT = process.env.PORT || 7100,
    ngrokTunnel;

function webdriverCfg() {
  const service = (process.env.SELENIUM_SERVICE || '').toLowerCase();
  if (service === 'browserstack') {
    return {
      baseUrl: ngrokTunnel,
      host: 'hub-cloud.browserstack.com',
      port: 80,
      services: ['browserstack'],
      user: process.env.WDIO_USER,
      key: process.env.WDIO_KEY,
    };
  } else if (service === 'saucelabs') {
    return {
      baseUrl: ngrokTunnel,
      host: 'ondemand.saucelabs.com',
      port: 80,
      services: ['sauce'],
      user: process.env.WDIO_USER,
      key: process.env.WDIO_KEY,
    };
  }
  // seleinum server must be running on localhost
  return {
    baseUrl: `localhost:${ SERVER_PORT }`,
  };
}

function rollup(cfg) {
  return rollupStream(Object.assign({
    moduleName: 'i18n',
    // amd, cjs, es, iife, umd
    format: 'umd',
    plugins: [
      babel({
        exclude: 'node_modules/**'
      }),
    ],
    globals: {
      'whatwg-fetch': 'fetch',
      react: 'React',
      'react-dom': 'ReactDOM',
      'node-fetch': 'fetch',
    }
  }, cfg))
  .on('error', function(error) {
    $.util.log($.util.colors.red(`Error (${ error.plugin }):\n${ error.message }\n`));
    if (isDev) {
      this.emit('end');
    } else {
      process.exit(1);
    }
  });
}

function noop() {}

function server(opts, cb) {
  const initOpts = Object.assign({
    server: {
      baseDir: "./tmp",
      routes: {
          "/node_modules": "node_modules",
      }
    },
    port: SERVER_PORT,
  }, opts);
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
    addr: SERVER_PORT,
  }, function (err, url) {
    if (err) {
      $.util.log($.util.colors.red(`Failed to start proxy\n${ err }`));
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
  })
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
  })
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

gulp.task('dev', [ 'examples' ], function() {
  isDev = true;
  server({});

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

gulp.task('test:unit', function (done) {
  new Karma({
    configFile: __dirname + '/conf/karma.conf.js',
  }, function () {
    done();
  }).start();
});

gulp.task('test:e2e:server', function (done) {
  $.util.log('Starting server');
  server({
    open: false,
  }, function () {
    $.util.log(`Server available on: localhost:${ SERVER_PORT }`);
    done();
  });
});

gulp.task('test:e2e', ['proxy', 'test:e2e:server'], function() {
  $.util.log('Running test:e2e');
  let error = false;
  return gulp
    .src('conf/wdio.js')
    .pipe($.webdriver(webdriverCfg()))
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

gulp.task('postpublish', function () {
  return gulp
    .src('./package.json')
    .pipe($.gitTag())
    .pipe($.gitPush({
      repository: 'origin',
      refspec: 'HEAD'
    }));
});

gulp.task('default', ['examples', 'test:unit', 'test:e2e']);
