
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    browserSync = require('browser-sync').create(),
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

function webpackCfg(overrides) {
  return Object.assign({
    quiet: true,
    module: {
      loaders: [{
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }]
    }
  }, overrides);
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

gulp.task('dist', function() {
  return gulp.src('src/index.js')
  .pipe($.webpack(webpackCfg({
    output: {
      library: 'i18n',
      libraryTarget: 'umd',
    }
  })))
  .pipe($.rename('react-i18n.js'))
  .pipe(gulp.dest('./dist'))
  .pipe($.uglify())
  .pipe($.rename('react-i18n.min.js'))
  .pipe(gulp.dest('./dist'));
});

gulp.task('build', function() {
  return gulp.src([
    'src/**/*.js',
    'src/**/*.jsx',
  ])
  .pipe($.babel())
  .pipe(gulp.dest('lib'));
});

gulp.task('examples:dist', function() {
  return gulp.src('./examples/index.jsx')
  .pipe($.webpack(webpackCfg({
    output: {
      library: 'i18n',
      libraryTarget: 'umd',
    }
  })))
  .pipe($.rename('index.js'))
  .pipe(gulp.dest('./tmp'));
});

gulp.task('examples:copy', function() {
  return gulp.src([
    'examples/*.html',
    'examples/**/*.lang.json',
  ])
  .pipe(gulp.dest('tmp'));
});

gulp.task('examples', ['examples:dist', 'examples:copy']);

const devTasks = [ 'build', 'dist', 'examples' ];
gulp.task('dev', devTasks, function() {
  isDev = true;
  server({});

  gulp.watch([
    "src/*.js",
    "examples/*.jsx",
    "examples/*.html",
  ], devTasks).on("change", function () {
    $.util.log('Rebuilt examples');
    browserSync.reload();
  });
});

gulp.task('test:unit', ['dist'], function (done) {
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
  var error = false;
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


gulp.task('lint', () => {
  return gulp.src([
      'src/**/*.js',
      'src/**/*.jsx',
      '!node_modules/**',
    ])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});


gulp.task('postpublish', function (done) {
  const pkg = require('./package.json');
  const version = `v${ pkg.version }`;
  const message = `Release ${ version }`;
  gulp.src('./package.json')
    .pipe($.git.commit(message))
    .on('end', function () {
      $.git.tag(version, message, function (err) {
        if (err) {
          $.util.log($.util.colors.red(err));
          done();
        } else {
          $.git.push('origin', 'master', { args: " --tags" }, function (err) {
            if (err) {
              $.util.log($.util.colors.red(err));
            }
            done();
          });
        }
      });
    });
});

gulp.task('default', ['build', 'examples', 'test:unit', 'test:e2e']);
