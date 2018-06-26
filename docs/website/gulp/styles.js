'use strict';

const browserSync = require('browser-sync'),
    gulp = require('gulp'),
    path = require('path');

const $ = require('gulp-load-plugins')();

const conf = require('./conf');


gulp.task('styles', () => {
    const sassOptions = {
        style: 'expanded',
    };

    return gulp.src([
        path.join(conf.paths.scss, '/index.scss'),
        path.join(conf.paths.scss, '/vendor.scss'),
    ])
        .pipe($.sourcemaps.init())
        .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
        .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/')))
        .pipe(browserSync.reload({stream: true}));
});
