'use strict';

const browserSync = require('browser-sync'),
    gulp = require('gulp'),
    path = require('path');

const conf = require('./conf');


function isOnlyChange(event) {
    return event.type === 'changed';
}


gulp.task('watch', ['scripts:watch', 'styles'], () => {
    gulp.watch([
        path.join(conf.paths.scss, '/**/*.scss'),
    ], () => {
        gulp.start('styles');
    });

    gulp.watch([
        path.join(conf.paths.src, '/index.html'),
    ], (event) => {
        browserSync.reload(event.path);
    });
});
