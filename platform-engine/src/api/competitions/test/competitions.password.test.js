'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Competitions - password', function test() {
    this.timeout(config.test.timeout);

    const
        playerData = _.merge({}, playersData[0]),
        competitionData = _.merge({}, competitionsData[0], {
            password: 'thereisapassword',
        });


    const data = {
        players: [playerData],
        competitions: [competitionData],
    };

    testHooksCleanInit(data);

    let competition;
    it('should get all competitions', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competition = res.body[0];

                expect(competition.password).to.eql(competitionData.password);
            })
        ;
    });


    it('should not register to a competition without a password (player)', () => {
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


    it('should register to a competition without a password (admin)', () => {
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


    it('should unregister to a competition (admin)', () => {
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


    it('should not register to a competition with a wrong password (player)', () => {
        this.timeout(config.test.timeout);

        const payload = {
            password: 'wrong password',
        };

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
            json: payload,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should register to a competition with a password (player)', () => {
        this.timeout(config.test.timeout);

        const payload = {
            password: competitionData.password,
        };

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
            json: payload,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });
});
