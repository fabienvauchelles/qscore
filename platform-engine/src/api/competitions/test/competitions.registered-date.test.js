'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai'),
    moment = require('moment');


const
    config = require('../../../config'),
    {requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Competitions - registered date', function test() {
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


    it('should not register to a future competition (player)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should register to a future competition (admin)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should unregister from a future competition (admin)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'DELETE',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
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


    it('should not register to a past competition (player)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayer(opts)
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


    it('should register to an actual competition (player)', () => {
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
});
