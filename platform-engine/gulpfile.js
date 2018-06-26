'use strict';
/* eslint-disable no-console */

const
    {spawn} = require('child_process'),
    gulp = require('gulp'),
    path = require('path');

const
    config = require('./src/config');

const $ = require('gulp-load-plugins')({
    pattern: ['gulp-*'],
});

const paths = {
    src: 'src',
    tools: 'tools',
};

const mochaOptions = {
    timeout: config.test.timeout,
    noColors: true,
};


gulp.task(
    'lint',
    () => gulp.src([
        path.join(paths.src, '**', '*.js'),
        path.join(paths.tools, '**', '*.js'),
        `!${path.join('node_modules', '**')}`,
        'setup.js',
        'gulpfile.js',
    ])
        .pipe($.eslint())
        .pipe($.eslint.format())
);


gulp.task(
    'docker:image:up',
    (done) => {
        const errors = [];

        console.log('Starting docker images...');
        const dockerUp = spawn('docker-compose', [
            '--file',
            'test/docker-compose.image.yml',
            'up',
            '-d',
            '--build',
            '--force-recreate',
        ]);

        dockerUp.stderr.on('data', (data) => console.log(data.toString()));
        dockerUp.stdout.on('data', (data) => console.log(data.toString()));

        dockerUp.on('error', (err) => {
            console.log(err);
            errors.push(err);
        });

        dockerUp.on('exit', (code, signal) => {
            if (code) {
                const message = `docker-compose up exited with code ${code}`;
                console.log(message);
                errors.push(new Error(message));
            }

            if (signal) {
                const message = `docker-compose up exited because of signal ${signal}`;
                console.log(message);
                errors.push(new Error(message));
            }

            if (errors.length) {
                return stopDocker('test/docker-compose.image.yml', (err) => {
                    if (err) {
                        errors.push(err);
                    }

                    return done(new MultipleErrors(errors));
                });
            }

            console.log('docker-compose up exited cleanly');

            return done();
        });
    }
);


gulp.task(
    'docker:build:up',
    (done) => {
        const errors = [];

        console.log('Starting docker images...');
        const dockerUp = spawn('docker-compose', [
            '--file',
            'test/docker-compose.build.yml',
            'up',
            '-d',
            '--build',
            '--force-recreate',
        ]);

        dockerUp.stderr.on('data', (data) => console.log(data.toString()));
        dockerUp.stdout.on('data', (data) => console.log(data.toString()));

        dockerUp.on('error', (err) => {
            console.log(err);
            errors.push(err);
        });

        dockerUp.on('exit', (code, signal) => {
            if (code) {
                const message = `docker-compose up exited with code ${code}`;
                console.log(message);
                errors.push(new Error(message));
            }

            if (signal) {
                const message = `docker-compose up exited because of signal ${signal}`;
                console.log(message);
                errors.push(new Error(message));
            }

            if (errors.length) {
                return stopDocker('test/docker-compose.build.yml', (err) => {
                    if (err) {
                        errors.push(err);
                    }

                    return done(new MultipleErrors(errors));
                });
            }

            console.log('docker-compose up exited cleanly');

            return done();
        });
    }
);


gulp.task(
    'test:docker:image',
    ['docker:image:up'],
    () => {
        let pending = true;
        const errors = [];

        return gulp
            .src(
                [
                    path.join(paths.src, '**', '*.test.js'),
                ],
                {read: false}
            )
            .pipe($.mocha(mochaOptions))
            .on('error', (err) => finish(err))
            .on('end', () => finish())
            ;


        ////////////

        function finish(err) {
            if (pending) {
                if (err) {
                    errors.push(err);
                }

                pending = false;

                return stopDocker('test/docker-compose.image.yml', (error) => {
                    if (error) {
                        errors.push(error);
                    }

                    if (errors.length) {
                        return dockerLogs(() => handleError(new MultipleErrors(errors)));
                    }
                });
            }
        }
    }
);


gulp.task(
    'test:docker:build',
    ['docker:build:up'],
    () => {
        let pending = true;
        const errors = [];

        return gulp
            .src(
                [
                    path.join(paths.src, '**', '*.test.js'),
                ],
                {read: false}
            )
            .pipe($.mocha(mochaOptions))
            .on('error', (err) => finish(err))
            .on('end', () => finish())
            ;


        ////////////

        function finish(err) {
            if (pending) {
                if (err) {
                    errors.push(err);
                }

                pending = false;

                return stopDocker('test/docker-compose.build.yml', (error) => {
                    if (error) {
                        errors.push(error);
                    }

                    if (errors.length) {
                        return dockerLogs(() => handleError(new MultipleErrors(errors)));
                    }
                });
            }
        }
    }
);


gulp.task(
    'test',
    () => gulp
    .src(
        [
            path.join(paths.src, '**', '*.test.js'),
        ],
        {read: false}
    )
    .pipe($.mocha(mochaOptions))
);


/////////////

function handleError(err) {
    console.log(err.toString());
    process.exit(1);
}


function dockerLogs(finalDone) {
    console.log('Printing docker logs for debugging...');
    console.log('');
    // callback hell ftw!
    printDockerLogs(
        'test_qs-platform-test_1',
        () => printDockerLogs(
            'test_qs-score-test_1',
            () => printDockerLogs(
                'test_postgres_1',
                () => printDockerLogs(
                    'test_rabbitmq_1',
                    () => printDockerLogs(
                        'test_redis_1',
                        () => finalDone()
                    )
                )
            )
        )
    );


    ////////////

    function printDockerLogs(name, done) {
        let
            printStderr = true,
            printStdout = true;

        const logs = spawn('docker', ['logs', name]);
        console.log(name);
        console.log('-'.repeat(name.length));
        console.log('');

        logs.stderr.on('data', (data) => {
            if (printStderr) {
                console.log('[stderr]');
                printStderr = false;
            }
            console.log(data.toString());
            printStdout = true;
        });

        logs.stdout.on('data', (data) => {
            if (printStdout) {
                console.log('[stdout]');
                printStdout = false;
            }
            console.log(data.toString());
            printStderr = true;
        });

        logs.on('error', (err) => console.log(err.toString()));

        logs.on('exit', () => {
            console.log('================================================================================');
            console.log('');

            return done();
        });
    }
}


function stopDocker(dockerfile, done) {
    const errors = [];

    console.log('Cleaning docker images...');
    const dockerStop = spawn('docker-compose', ['--file', dockerfile, 'stop']);

    dockerStop.stderr.on('data', (data) => console.log(data.toString()));
    dockerStop.stdout.on('data', (data) => console.log(data.toString()));

    dockerStop.on('error', (err) => {
        console.log(err.toString());
        errors.push(err);
    });

    dockerStop.on('exit', (code, signal) => {
        if (code) {
            const message = `docker-compose stop exited with code ${code}`;
            console.log(message);
            errors.push(new Error(message));
        }

        if (signal) {
            const message = `docker-compose stop exited because of signal ${signal}`;
            console.log(message);
            errors.push(new Error(message));
        }

        if (errors.length) {
            return done(new MultipleErrors(errors));
        }

        console.log('docker-compose stop exited cleanly');

        return done();
    });
}


class MultipleErrors extends Error {

    constructor(errors) {
        super();
        this.errors = [];

        errors.forEach((error) => {
            if (error instanceof MultipleErrors) {
                this.errors.push(...error.errors);
            }
            else if (error.message.startsWith('Command failed: mocha')) {
                this.errors.push(new Error('Tests failed'));
            }
            else {
                this.errors.push(error);
            }
        });

        // http://stackoverflow.com/questions/35392675/how-to-override-error-stack-getter
        this.stack = this.buildStack();
    }


    get message() {
        const messages = this.errors.map((error) => `\t* ${error.name}: ${error.message}`);
        return ['Multiple errors occurred:', ...messages].join('\n');
    }


    buildStack() {
        const stacks = this.errors.map((error) => error.stack);
        return stacks.join('\n================================================================================\n');
    }


    get stack() {
        return this._stack;
    }


    set stack(s) {
        this._stack = s;
    }


    toString() {
        return [this.message, this.stack].join('\n');
    }
}
