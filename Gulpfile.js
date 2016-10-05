
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
      rename: {
        'gulp-contrib-copy': 'copy',
      }
    }),
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

gulp.task('build:examples', function() {
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

gulp.task('copy:examples', function() {
  return gulp.src([
    'examples/*.html',
    'examples/**/*.lang.json',
  ])
  .pipe($.copy('tmp'))
  .pipe(gulp.dest('tmp'));
});

gulp.task('examples', ['build:examples', 'copy:examples']);

gulp.task('dev', [ 'build', 'examples' ], function() {
  isDev = true;

  browserSync.init({
    server: {
      baseDir: "./tmp"
    }
  });

  gulp.watch([
    "src/*.js",
    "examples/*.jsx"
  ], [
    'build:examples'
  ]).on("change", function () {
    console.log('Rebuilt examples');
    browserSync.reload();
  });
});
