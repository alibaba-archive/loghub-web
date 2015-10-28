
'use strict'

var gulp = require('gulp')
var babel = require('gulp-babel')
var rename = require('gulp-rename')

gulp.task('build', function () {
  return gulp.src('src/loghub.js')
             .pipe(babel())
             .pipe(rename('index.js'))
             .pipe(gulp.dest('.'))
})
