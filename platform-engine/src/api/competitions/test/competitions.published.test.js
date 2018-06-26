'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {competitionsController} = require('../../../model/competitions/competitions.controller'),
    {requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Competitions - (player) published', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const competitionData = _.merge({}, competitionsData[0], {
        published: false,
    });

    const data = {
        players: [playerData],
        competitions: [competitionData],
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


    it('should not list an unpublished competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionsFound = res.body;

                expect(competitionsFound).to.be.an('array').that.is.empty;
            })
        ;
    });


    it('should not get an unpublished competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should not register to a unpublished competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competitions[0].id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(404);
            })
        ;
    });


    it('should published a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competitions[0].id}`,
            json: {
                published: true,
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competitions[0] = _.pick(res.body, competitionsController.FIELDS_ALL);
            })
        ;
    });


    it('should list a published competition', () => {
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

                expect(competitionsFound[0]).to.deep.equals(competitions[0]);
            })
        ;
    });


    it('should register to a published competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competitions[0].id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);

                competitions[0].registered = true;
            })
        ;
    });


    it('should get an published & registered competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should unpublished a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competitions[0].id}`,
            json: {
                published: false,
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should not list an unpublished but registered competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionsFound = res.body;

                expect(competitionsFound).to.be.an('array').that.is.empty;
            })
        ;
    });


    it('should not get an unpublished but registered competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should not unregister from an unpublished competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'DELETE',
            url: `api/competitions/${competitions[0].id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });
});
