'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    net = require('net'),
    winston = require('winston');

const
    {retry} = require('../helpers');



class NetWait {
    constructor(host, port, maxDelay = 1000) {
        this._host = host;
        this._port = port;
        this._maxDelay = maxDelay;
    }


    waitForIt(options) {
        winston.debug('[NetWait] waitForIt()');

        return retry(
            () => this._attemptToConnectAndWait(),
            _.merge({}, options)
        );
    }


    _attemptToConnectAndWait() {
        return this
            ._attemptToConnect()
            .catch((err) => Promise.delay(1000).then(() => {
                throw err;
            }))
        ;
    }


    _attemptToConnect() {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();

            const timeout = setTimeout(() => {
                try {
                    client.close();
                }
                catch (errClose) {
                    // Ignore
                }

                return reject();
            }, this._maxDelay);

            client.on('connect', () => {
                clearTimeout(timeout);

                try {
                    client.close();
                }
                catch (errClose) {
                    // Ignore
                }

                return resolve();
            });

            client.on('error', (err) => {
                clearTimeout(timeout);

                try {
                    client.close();
                }
                catch (errClose) {
                    // Ignore
                }

                return reject(err);
            });

            client.connect(this._port, this._host);
        });
    }
}


////////////

module.exports = NetWait;
