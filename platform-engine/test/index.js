'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    {expect} = require('chai'),
    jwt = require('jsonwebtoken'),
    moment = require('moment'),
    request = require('request'),
    winston = require('winston');

const
    {retry} = require('../src/common/helpers'),
    config = require('../src/config'),
    server = require('../src/server'),
    sigStop = require('../src/common/sigstop');


winston.level = 'debug';



const
    playersData = require('./players'),
    competitionsData = require('./competitions');

const
    now = moment(),
    start = now.clone().add(-1, 'd').toISOString(),
    end = now.clone().add(1, 'd').toISOString();

competitionsData.forEach((c) => {
    c.date_start = start;
    c.date_end = end;
});



function signPlayer(payload) {
    return jwt.sign(
        payload,
        config.auth.player.secret,
        {
            audience: config.auth.player.audience,
            issuer: config.auth.player.issuer,
        }
    );
}


function signAdmin(payload) {
    return jwt.sign(
        payload,
        config.auth.admin.secret,
        {
            audience: config.auth.admin.audience,
            issuer: config.auth.admin.issuer,
        }
    );
}



function requestAsync(opts) {
    return new Promise((resolve, reject) => {
        opts.baseUrl = config.server.url;

        if (!opts.json) {
            opts.json = true;
        }

        request(opts, (err, res) => {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        });
    });
}


function requestPlayerAsync(opts, sub) {
    opts.auth = {
        bearer: signPlayer({
            sub: sub || playersData[0].base.sub,
            scope: '',
        }),
    };

    return requestAsync(opts);
}


function requestPlayerAdminAsync(opts) {
    opts.auth = {
        bearer: signPlayer({
            sub: playersData[0].base.sub,
            scope: 'admin',
        }),
    };

    return requestAsync(opts);
}


function requestAdminAsync(opts) {
    opts.auth = {
        bearer: signAdmin({}),
    };

    return requestAsync(opts);
}


function testHooksClean() {
    before('Clean the database', () => {
        const opts = {
            method: 'DELETE',
            url: 'api/clean',
        };

        return requestAdminAsync(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });
}



function testHooksCleanInit(data) {
    testHooksClean();

    before('Init the database', () => {
        return Promise.all([
            Promise.map(data.players || [], createPlayer),
            Promise.map(data.competitions || [], createCompetition),
        ]);

        ////////////

        function createPlayer(player) {
            const
                token = signPlayer(player.base),
                json = {token};

            if (player.extra) {
                json.player = player.extra;
            }

            const opts = {
                method: 'POST',
                url: 'api/players/me',
                json,
            };

            return requestAsync(opts)
                .then((res) => {
                    expect(res.statusCode).to.eql(200);
                })
            ;
        }

        function createCompetition(competition) {
            const opts = {
                method: 'POST',
                url: 'api/competitions',
                json: competition,
            };

            return requestPlayerAdminAsync(opts)
                .then((res) => {
                    expect(res.statusCode).to.eql(201);
                })
            ;
        }
    });
}



// Register the stop event
let runTest = true;
sigStop(() => {
    runTest = false;

    stopServer()
        .catch((err) => winston.error(err));
});


before('Start server', function test() {
    this.timeout(config.test.timeout);

    if (process.env.DOCKER) {
        return waitForServer(config.server.url, {timeout: config.test.timeout * 0.9});
    }
    else {
        return server.start({timeout: config.test.timeout * 0.9});
    }
});


function waitForServer(serverUrl, options) {
    return retry(
        () => requestAsync({
            method: 'GET',
            url: '/',
            json: true,
        }),
        _.merge({keepTrying: () => runTest}, options)
    );
}


function stopServer() {
    if (process.env.DOCKER) {
        return Promise.resolve();
    }
    else {
        return server.stop();
    }
}


after('Stop server', function test() {
    this.timeout(10000);

    return stopServer();
});


////////////

module.exports = {
    playersData,
    competitionsData,
    request: requestAsync,
    requestPlayer: requestPlayerAsync,
    requestPlayerAdmin: requestPlayerAdminAsync,
    requestAdmin: requestAdminAsync,
    signPlayer,
    signAdmin,
    testHooksClean,
    testHooksCleanInit,
};
