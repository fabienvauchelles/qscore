'use strict';

const
    Promise = require('bluebird'),
    winston = require('winston');



function retry(func, options) {
    const {
        timeout = Infinity,
        fatalError = () => false,
        retries = -1,
        delay = 1000,
        keepTrying = () => true,
    } = options;

    if (!keepTrying()) {
        return Promise.reject(new Error(`${func.name || 'Action'} interrupted`));
    }

    let result;
    try {
        result = Promise.resolve(func());
    }
    catch (err) {
        result = Promise.reject(err);
    }

    return result
        .catch(fatalError, (err) => {
            throw err;
        })
        .catch((err) => {
            if (retries === 0) {
                throw err;
            }

            if (timeout <= 0) {
                throw new Error('Timeout');
            }
            winston.error(`${func.name}: ${err.name}: ${err.message}`);

            // eslint-disable-next-line promise/no-nesting
            return Promise
                .delay(delay)
                .then(
                    () => retry(func, {keepTrying, timeout: timeout - delay, fatalError, retries: retries - 1, delay})
                )
            ;
        })
    ;
}


function trimFailsafe(v) {
    if (!v) {
        return;
    }

    const vTrim = v.trim();
    if (vTrim.length <= 0) {
        return;
    }

    return vTrim;
}



////////////

module.exports = {
    retry,
    trimFailsafe,
};
