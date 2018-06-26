'use strict';

const
    winston = require('winston');

const
    server = require('./server'),
    sigStop = require('./common/sigstop');


// Register the stop event
sigStop(() => server
    .stop()
    .catch((err) => winston.error(err))
    .finally(() => {
        process.exit(0);
    })
);

winston.info('[PlatformEngine] Starting');
server
    .start()
    .catch((err) => {
        winston.error('[FATAL ERROR] The server will stop now because of the following error:\n', err);
        return server.stop();
    })
    .catch((err) => winston.error(err))
;
