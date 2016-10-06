
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    browserSync = require('browser-sync').create(),
    rollup = require('rollup-stream'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    babel = require('rollup-plugin-babel'),
    isDev = false,
    nodeResolve = require('rollup-plugin-node-resolve'),
    commonjs = require('rollup-plugin-commonjs');

function rollupErrorHandler(error) {
  $.util.log($.util.colors.red(`Error (${ error.plugin }):\n${ error.message }\n`));
  if (isDev) {
    this.emit('end');
  } else {
    process.exit(1);
  }
}

function server() {
  browserSync.init(require(`${ __dirname }/conf/browserSyncCfg`));
}

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
  server();
});

gulp.task('dev', [ 'examples' ], function() {
  isDev = true;
  server();

  gulp.watch([
    "src/*.js",
    "examples/*.jsx"
  ], [
    'examples'
  ]).on("change", function () {
    console.log('Rebuilt examples');
    browserSync.reload();
  });
});
