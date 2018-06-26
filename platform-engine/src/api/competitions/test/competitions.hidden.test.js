'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Competitions - hidden', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const
        competitionData1 = _.merge({}, competitionsData[0]),
        competitionData2 = _.merge({}, competitionsData[1], {
            hidden: true,
        });

    const data = {
        players: [playerData],
        competitions: [competitionData1, competitionData2],
    };

    testHooksCleanInit(data);

    let competitions;
    before('should get all competitions', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competitions = res.body;
            })
        ;
    });


    it('should not list a hidden and unregistered competition (player)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionsFound = res.body;
                expect(competitionsFound).to.have.lengthOf(1);

                const competitionFound = competitionsFound[0];
                expect(competitionFound.id).to.eql(competitions[0].id);
            })
        ;
    });


    it('should list a hidden competition (admin)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionsFound = res.body;
                expect(competitionsFound).to.have.lengthOf(2);
            })
        ;
    });


    it('should register to a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competitions[1].id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);

                ++competitions[0].players_count;
            })
        ;
    });


    it('should list a hidden and registered competition (player)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionsFound = res.body;
                expect(competitionsFound).to.have.lengthOf(2);
            })
        ;
    });
});
