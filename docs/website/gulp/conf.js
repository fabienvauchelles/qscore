'use strict';

const gutil = require('gulp-util');

exports.paths = {
    dist: 'dist',
    gulp: 'gulp',
    scss: 'scss',
    src: 'src',
    tmp: '.tmp',
};

exports.errorHandler = (title) =>
    (err) => {
        gutil.log(gutil.colors.red(`[${title}]`), err.toString());

        /* eslint no-invalid-this: 0 */
        this.emit('end');
    };
