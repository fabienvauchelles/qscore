'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {competitionsController} = require('../../../model/competitions/competitions.controller'),
    {requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Competitions - (player) registered', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const data = {
        players: [playerData],
        competitions: [competitionsData[0]],
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


    it('should not get an unregistered competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should not get submissions of an unregistered competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should not get materials of an unregistered competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/materials`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should get an existing unregistered competition with rules', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/rules`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                expect(competitionFound.id).to.eql(competition.id);
                expect(competitionFound.title).to.eql(competition.title);
                expect(competitionFound.picture_url).to.eql(competition.picture_url);
                expect(competitionFound.rules).to.eql(competition.rules);
                expect(competitionFound.description).to.be.undefined;
            })
        ;
    });


    it('should get an existing unregistered competition with leaderboard infos', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/leaderboardinfos`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                expect(competitionFound.id).to.eql(competition.id);
                expect(competitionFound.title).to.eql(competition.title);
                expect(competitionFound.picture_url).to.eql(competition.picture_url);
                expect(competitionFound.date_start).to.eql(competition.date_start);
                expect(competitionFound.date_end).to.eql(competition.date_end);
                expect(competitionFound.leaderboard_html).to.eql(competition.leaderboard_html);
                expect(competitionFound.leaderboard_css).to.eql(competition.leaderboard_css);
                expect(competitionFound.leaderboard_js).to.eql(competition.leaderboard_js);
                expect(competitionFound.description).to.be.undefined;
            })
        ;
    });


    it('should have a player without competitions', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/players',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playerFound = res.body[0];
                expect(playerFound.competitions_count).to.eql(0);
            })
        ;
    });


    it('should have no player in the competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/players`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playersFound = res.body;
                expect(playersFound).to.be.an('array').that.is.empty;
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

                ++competition.players_count;
            })
        ;
    });


    it('should get a registered competition with extra informations', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                competitionsController.FIELDS_ONE.forEach((f) => {
                    expect(competitionFound[f]).to.equals(competition[f]);
                });

                expect(competitionFound.token).to.be.a('string');
            })
        ;
    });


    it('should get submissions of an registered competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should get materials of an registered competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/materials`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should have a player with 1 competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/players',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playerFound = res.body[0];
                expect(playerFound.competitions_count).to.eql(1);
            })
        ;
    });


    it('should have 1 player in the competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/players`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playersFound = res.body;
                expect(playersFound).to.have.lengthOf(1);

                const playerFound = playersFound[0];
                expect(playerFound.email).to.eql(playerData.merge.email);
            })
        ;
    });
});
