'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {competitionsController} = require('../../../model/competitions/competitions.controller'),
    {requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Competitions - (player) informations', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const data = {
        players: [playerData],
        competitions: [competitionsData[0]],
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


    it('should get all competitions with less informations', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionsFound = res.body;

                competitionsController.FIELDS_ALL.forEach((f) => {
                    expect(competitionsFound[0][f]).to.equals(competitions[0][f]);
                });
                _.difference(competitionsController.FIELDS_ONE, competitionsController.FIELDS_ALL).forEach((f) => {
                    expect(competitionsFound[0][f]).to.be.undefined;
                });
            })
        ;
    });


    it('should register to a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competitions[0].id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);

                ++competitions[0].players_count;
            })
        ;
    });


    it('should get a registered competitions with more informations', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                competitionsController.FIELDS_ONE.forEach((f) => {
                    expect(competitionFound[f]).to.equals(competitions[0][f]);
                });
            })
            ;
    });


    it('should get a registered competitions with selected informations', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}`,
            qs: {
                fields: ['title_short', 'description_short'].join(','),
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                expect(competitionFound.id).to.eql(competitions[0].id);
                expect(competitionFound.title_short).to.eql(competitions[0].title_short);
                expect(competitionFound.description_short).to.eql(competitions[0].description_short);
                expect(competitionFound.title).to.be.undefined;
                expect(competitionFound.description).to.be.undefined;
            })
            ;
    });
});
