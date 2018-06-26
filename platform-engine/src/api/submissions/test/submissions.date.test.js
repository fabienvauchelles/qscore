'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    fs = require('fs'),
    {expect} = require('chai'),
    moment = require('moment'),
    path = require('path');


const
    config = require('../../../config'),
    {request, requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Submissions - date', function test() {
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


    it('should update competition to future date', () => {
        this.timeout(config.test.timeout);

        const
            now = moment(),
            start = now.clone().add(2, 'h'),
            end = start.clone().add(2, 'h');

        const payload = _.merge({}, competitionData, {
            date_start: start.toDate(),
            date_end: end.toDate(),
        });

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competition.id}`,
            json: payload,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should not submit a file to a future competition', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'score-010.csv')),
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
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should update competition to past date', () => {
        this.timeout(config.test.timeout);

        const
            now = moment(),
            end = now.clone().add(-2, 'h'),
            start = end.clone().add(-2, 'h');


        const payload = _.merge({}, competitionData, {
            date_start: start.toDate(),
            date_end: end.toDate(),
        });

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competition.id}`,
            json: payload,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should not submit a file to a past competition', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'score-010.csv')),
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
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should update competition to now', () => {
        this.timeout(config.test.timeout);

        const
            now = moment(),
            start = now.clone().add(-1, 'h'),
            end = start.clone().add(2, 'h');

        const payload = _.merge({}, competitionData, {
            date_start: start.toDate(),
            date_end: end.toDate(),
        });

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competition.id}`,
            json: payload,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should not submit an actual competition', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'score-010.csv')),
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
});
