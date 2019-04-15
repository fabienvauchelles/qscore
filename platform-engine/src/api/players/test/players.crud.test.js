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

        const token = signPlayer(_.omit(playerData.base, 'email'));

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {
                token,
                player: playerData.extra,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(400);
            })
        ;
    });


    it('should not create a player with an incomplete extra profile', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer(playerData.base);

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

        const token = signPlayer(playerData.base);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {
                token,
                player: playerData.extra,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should get the 1st player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/players/${playerData.base.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                player = res.body;

                expect(player.sub).to.be.a('string');

                expect(
                    _.omit(player, ['created_at', 'updated_at'])
                ).to.deep.equal(playerData.merge);
            })
        ;
    });


    it('should override the 1st player without extra information', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer(_.merge({}, playerData.base, {
            name: 'a new name',
        }));

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {
                token,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should get the 1st player with new basic information', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/players/${playerData.base.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                player = res.body;

                expect(player.sub).to.be.a('string');

                expect(
                    _.omit(player, ['created_at', 'updated_at'])
                ).to.deep.equal(_.merge({}, playerData.merge, {
                    name_orig: 'a new name',
                    picture_url: playerData.base.picture_url,
                }));
            })
            ;
    });


    it('should override the 1st player with extra information', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer(playerData.base);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {
                token,
                player: {
                    name: 'other name',
                    picture_url: 'http://stuff.picture.com',
                },
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should get the 1st player with new extra information', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/players/${playerData.base.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                player = res.body;

                expect(player.sub).to.be.a('string');

                expect(
                    _.omit(player, ['created_at', 'updated_at'])
                ).to.deep.equal(_.merge({}, playerData.merge, {
                    name: 'other name',
                    name_extra: 'other name',
                    picture_url: 'http://stuff.picture.com',
                }));
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

        const token = signPlayer(playerData.base);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {
                token,
                player: playerData.extra,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should get the 1st player with new parameters', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/players/${playerData.base.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                player = res.body;

                expect(player.sub).to.be.a('string');
                expect(
                    _.omit(player, ['created_at', 'updated_at'])
                ).to.deep.equal(playerData.merge);
            })
        ;
    });


    it('should create a 2nd player', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer(playersData[1].base);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {
                token,
                player: playersData[1].extra,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should get the 2nd player', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/players/${playersData[1].base.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const player2 = res.body;

                expect(player2.sub).to.be.a('string');
                expect(
                    _.omit(player2, ['created_at', 'updated_at'])
                ).to.deep.equal(playersData[1].merge);
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

        const otherPlayer = _.merge({}, playersData[1].base, {
            email: playersData[0].base.email,
        });

        const token = signPlayer(otherPlayer);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {
                token,
                player: playersData[2].extra,
            },
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
            url: `api/players/${playersData[0].base.sub}`,
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
            url: `api/players/${playersData[1].base.sub}`,
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
