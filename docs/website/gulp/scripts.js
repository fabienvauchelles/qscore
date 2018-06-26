'use strict';

const browserSync = require('browser-sync'),
    gulp = require('gulp'),
    path = require('path'),
    webpack = require('webpack-stream');

const $ = require('gulp-load-plugins')();

const conf = require('./conf');


function webpackWrapper(watch, callback) {
    const webpackOptions = {
        watch,
        module: {
            preLoaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loader: 'eslint-loader',
                },
            ],
            loaders: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    loaders: [
                        'babel?presets[]=es2015',
                    ],
                },
            ],
        },
        output: {filename: 'index.js'},
    };

    if (watch) {
        webpackOptions.devtool = 'inline-source-map';
    }

    function webpackChangeHandler(err, stats) {
        if (err) {
            conf.errorHandler('Webpack')(err);
        }

        $.util.log(stats.toString({
            colors: $.util.colors.supportsColor,
            chunks: false,
            hash: false,
            version: false,
        }));

        browserSync.reload();
        if (watch) {
            watch = false;
            return callback();
        }
    }

    const sources = [path.join(conf.paths.src, '/index.js')];

    return gulp.src(sources)
        .pipe(webpack(webpackOptions, null, webpackChangeHandler))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve')));
}

gulp.task('scripts', () => webpackWrapper(false));
gulp.task('scripts:watch', ['scripts'], (callback) => webpackWrapper(true, callback));

gulp.task('lint',
    () => gulp.src([
        path.join(conf.paths.src, '/index.js'),
        path.join(conf.paths.gulp, '/**/*.js'),
        'gulpfile.js',
        '!node_modules/**',
    ])
        .pipe($.eslint())
        .pipe($.eslint.format())
);
