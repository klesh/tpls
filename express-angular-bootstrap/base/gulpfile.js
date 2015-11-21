var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var sass = require('gulp-sass');

// build up third party libs
gulp.task('initial', function() {
  gulp.src([
    'bower_components/angular/angular.min.js', 
    'bower_components/angular-route/angular-route.min.js',
    'bower_components/angular-resource/angular-resource.min.js',
    'bower_components/angular-messages/angular-messages.min.js',
    'bower_components/a0-angular-storage/dist/angular-storage.min.js',
    'bower_components/angular-animate/angular-animate.min.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'bower_components/angular-i18n/angular-locale_zh-hans.js',
    'bower_components/lodash/lodash.min.js'
  ])
  .pipe(concat('lib.js'))
  .pipe(gulp.dest('public/js/'));

  gulp.src([
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
    'bower_components/angular-bootstrap/ui-bootstrap.min.css',
    'bower_components/angular-motion/dist/angular-motion.min.css'
  ])
  .pipe(concat('lib.css'))
  .pipe(gulp.dest('public/css/'));

  gulp.src('bower_components/bootstrap/fonts/*')
  .pipe(gulp.dest('public/fonts/'));
});

// bulid up app js file
gulp.task('script', function() {
  return gulp.src('private/js/*.js')
  .pipe(uglify())
  .pipe(concat('all.js'))
  .pipe(gulp.dest('public/js/'));
});

// build up app css file
gulp.task('style', function() {
  return gulp.src('private/css/*.scss')
  .pipe(sass())
  .pipe(minify())
  .pipe(concat('all.css'))
  .pipe(gulp.dest('public/css/'));
});

gulp.task('watch', function() {
  // gulp.watch('private/js/*.js', [ 'script' ]);
  gulp.watch('private/css/*.scss', [ 'style' ]);
});
