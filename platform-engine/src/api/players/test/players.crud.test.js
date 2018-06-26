'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {playersData, request, requestPlayerAdmin, signPlayer, testHooksClean} = require('../../../../test');



describe('Players - CRUD', function test() {
    this.timeout(config.test.timeout);

    testHooksClean();

    let player;

    const playerData = _.merge({}, playersData[0]);


    it('should have no player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/players',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playersFound = res.body;

                expect(playersFound).to.be.an('array').that.is.empty;
            })
        ;
    });


    it('should not get an unexisting player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/players/unknown',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(404);
            })
        ;
    });


    it('should not create a player with an incomplete profile', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer(_.omit(playerData, 'email'));

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(400);
            })
        ;
    });


    it('should create the 1st player', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer(playerData);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should get the 1st player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/players/${playerData.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                player = res.body;

                expect(player.sub).to.be.a('string');
                expect(
                    _.omit(player, ['created_at', 'updated_at'])
                ).to.deep.equal(playerData);
            })
        ;
    });


    it('should have 1 player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/players',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playersFound = res.body;
                expect(playersFound).to.have.lengthOf(1);

                const playerFound = playersFound[0];
                expect(playerFound.competitions_count).to.eql(0);

                delete playerFound.competitions_count;
                expect(playerFound).to.deep.equals(player);
            })
        ;
    });


    it('should override parameters of the 1st player', () => {
        this.timeout(config.test.timeout);

        _.merge(playerData, {
            name: 'Armind Stone',
            picture_url: 'https://nopicture.com',
        });

        const token = signPlayer(playerData);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should get the 1st player with new parameters', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/players/${playerData.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                player = res.body;

                expect(player.sub).to.be.a('string');
                expect(
                    _.omit(player, ['created_at', 'updated_at'])
                ).to.deep.equal(playerData);
            })
        ;
    });


    it('should create a 2nd player', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer(playersData[1]);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should get the 2nd player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/players/${playersData[1].sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const player2 = res.body;

                expect(player2.sub).to.be.a('string');
                expect(
                    _.omit(player2, ['created_at', 'updated_at'])
                ).to.deep.equal(playersData[1]);
            })
            ;
    });


    it('should have 2 players', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/players',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playersFound = res.body;
                expect(playersFound).to.have.lengthOf(2);
            })
        ;
    });


    it('should not create a player with an existing email', () => {
        this.timeout(config.test.timeout);

        const otherPlayer = _.merge({}, playersData[2], {
            email: playersData[0].email,
        });

        const token = signPlayer(otherPlayer);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(400);
            })
        ;
    });


    it('should remove the 1st player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'DELETE',
            url: `api/players/${playersData[0].sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should remove the 2nd player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'DELETE',
            url: `api/players/${playersData[1].sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
            ;
    });


    it('should have no player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/players',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playersFound = res.body;

                expect(playersFound).to.be.an('array').that.is.empty;
            })
        ;
    });
});
