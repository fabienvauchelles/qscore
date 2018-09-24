'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    fs = require('fs'),
    {expect} = require('chai'),
    path = require('path');


const
    config = require('../../../config'),
    {request, requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Submissions - Hide leaderboard', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const competitionData = _.merge({}, competitionsData[0]);

    const data = {
        players: [playerData],
        competitions: [competitionData],
    };

    testHooksCleanInit(data);

    let competition;
    before('should get all competitions', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competition = res.body[0];
            })
        ;
    });


    before('should register to a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    before('should get the registered competition with token', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competition = res.body;
            })
        ;
    });


    it('should submit a valid file with score 0.1', () => {
        this.timeout(config.test.timeout);

        const formData = _.merge({
            datafile: fs.createReadStream(path.join(__dirname, 'score-010.csv')),
        });

        const opts = {
            method: 'POST',
            url: 'api/submissions',
            formData,
            auth: {
                bearer: competition.token,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should wait to process submission', () => Promise.delay(config.test.submissions.wait));


    it('should have a leaderboard for anonymous view', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body[0].score).to.be.eql(0.1);
            })
        ;
    });


    it('should have a leaderboard for admin view', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body[0].score).to.be.eql(0.1);
            })
        ;
    });


    it('should hide the leaderboard', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competition.id}`,
            json: {
                leaderboard_hidden: true,
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competition.leaderboard_hidden = true;
            })
        ;
    });


    it('should not have a leaderboard for anonymous view', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should have a leaderboard for admin view', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body[0].score).to.be.eql(0.1);
            })
        ;
    });


    it('should show the leaderboard', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competition.id}`,
            json: {
                leaderboard_hidden: false,
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competition.leaderboard_hidden = false;
            })
        ;
    });


    it('should have a leaderboard for anonymous view', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body[0].score).to.be.eql(0.1);
            })
        ;
    });
});
