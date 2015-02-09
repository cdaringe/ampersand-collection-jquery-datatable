"use strict";

var gulp = require('gulp');
var browserify = require('gulp-browserify');

// Basic usage
gulp.task('browserify', function() {
    // Single entry point to browserify
    gulp.src('src/examples/dynamic-columns.js')
        .pipe(browserify({}))
        .pipe(gulp.dest('dist/examples'));
    gulp.src('src/examples/dynamic-rows.js')
        .pipe(browserify({}))
        .pipe(gulp.dest('dist/examples'));
});

gulp.task('default', ['browserify']);
