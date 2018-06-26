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



describe('Submissions - rates', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const competitionData = _.merge({}, competitionsData[0], {
        submission_delay: 10000,
    });

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


    it('should register to a competition', () => {
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


    it('should get the registered competition with token', () => {
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


    it('should submit a 1st score, which is accepted', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'score-010.csv')),
            comment: '',
        };

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


    it('should submit a 2nd score, which is refused (rate limit)', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'score-010.csv')),
            comment: '',
        };

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
                expect(res.statusCode).to.eql(429);
            })
        ;
    });
});
