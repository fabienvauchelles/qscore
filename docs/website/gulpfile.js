'use strict';

const gulp = require('gulp'),
    wrench = require('wrench');


wrench
    .readdirSyncRecursive('./gulp')
    .filter((file) => (/\.(js|coffee)$/i).test(file))
    .map((file) => require(`./gulp/${file}`));


gulp.task('default', ['clean'],
    () => gulp.start('build')
);
