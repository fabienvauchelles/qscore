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



describe('Competitions - Register strategy - Location', function test() {
    this.timeout(config.test.timeout);

    const
        playerData = _.merge({}, playersData[0]),
        competitionData = _.merge({}, competitionsData[0], {
            register_strategy_type: 2,
            register_strategy: {
                locations: {
                    'pwd1': 'location1',
                    'pwd2': 'location2',
                },
            },
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
                expect(competition.register_strategy_type).to.eql(competitionData.register_strategy_type);
                expect(competition.register_strategy).to.deep.eql(competitionData.register_strategy);
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


    it('should register to a competition with pwd1 to location1 (player)', () => {
        this.timeout(config.test.timeout);

        const payload = {
            password: 'pwd1',
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


    it('should submit a valid file with score 0.1', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, '../../submissions/test', 'score-010.csv')),
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


    it('should have a lead with a 1 score of 0.1', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const leadsFound = res.body;
                expect(leadsFound).to.have.lengthOf(1);

                const leadFound = leadsFound[0];
                expect(leadFound.rank).to.be.eql(1);
                expect(leadFound.player_location).to.be.eql('location1');
                expect(leadFound.score).to.be.eql(0.1);
            })
        ;
    });


    it('should unregister to a competition (player)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'DELETE',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should register to a competition with pwd2 to location2 (player)', () => {
        this.timeout(config.test.timeout);

        const payload = {
            password: 'pwd2',
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


    it('should submit a valid file with score 0.1', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, '../../submissions/test', 'score-020.csv')),
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


    it('should have a lead with a 1 score of 0.2', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const leadsFound = res.body;
                expect(leadsFound).to.have.lengthOf(1);

                const leadFound = leadsFound[0];
                expect(leadFound.rank).to.be.eql(1);
                expect(leadFound.player_location).to.be.eql('location2');
                expect(leadFound.score).to.be.eql(0.2);
            })
        ;
    });
});
