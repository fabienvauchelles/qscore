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



describe('Submissions - score reverse order', function test() {
    this.timeout(config.test.timeout);

    const
        player1data = _.merge({}, playersData[0]),
        player2data = _.merge({}, playersData[1]);

    const competitionData = _.merge({}, competitionsData[0], {
        score_order: false,
    });

    const data = {
        players: [player1data, player2data],
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


    before('should register to a competition with player 1', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    let competitionPlayer1;
    before('should get the registered competition with token for player 1', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competitionPlayer1 = res.body;
            })
        ;
    });


    before('should register to a competition with player 2', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    let competitionPlayer2;
    before('should get the registered competition with token for player 2', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competitionPlayer2 = res.body;
            })
        ;
    });


    it('should submit a valid file with score 0.2 (player 1)', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'score-020.csv')),
            comment: '',
        };

        const opts = {
            method: 'POST',
            url: 'api/submissions',
            formData,
            auth: {
                bearer: competitionPlayer1.token,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should submit a valid file with score 0.3 (player 2)', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'score-030.csv')),
            comment: '',
        };

        const opts = {
            method: 'POST',
            url: 'api/submissions',
            formData,
            auth: {
                bearer: competitionPlayer2.token,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should wait to process submission', () => Promise.delay(config.test.submissions.wait));


    it('should have a best score of 0.3 (player 2)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0.3);
            })
        ;
    });


    it('should have 2 leads', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const leadsFound = res.body;
                expect(leadsFound).to.have.lengthOf(2);

                const lead1found = leadsFound[0];
                expect(lead1found.rank).to.be.eql(1);
                expect(lead1found.player_name).to.be.eql(player1data.merge.name);
                expect(lead1found.player_picture_url).to.be.eql(player1data.merge.picture_url);
                expect(lead1found.score).to.be.eql(0.2);
                expect(lead1found.submissions_count).to.be.eql(1);

                const lead2found = leadsFound[1];
                expect(lead2found.rank).to.be.eql(2);
                expect(lead2found.player_name).to.be.eql(player2data.merge.name);
                expect(lead2found.player_picture_url).to.be.eql(player2data.merge.picture_url);
                expect(lead2found.score).to.be.eql(0.3);
                expect(lead2found.submissions_count).to.be.eql(1);
            })
        ;
    });


    it('should submit a valid file with score 0.1 (player 2)', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'score-010.csv')),
            comment: '',
        };

        const opts = {
            method: 'POST',
            url: 'api/submissions',
            formData,
            auth: {
                bearer: competitionPlayer2.token,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
            ;
    });


    it('should wait to process submission', () => Promise.delay(config.test.submissions.wait));


    it('should have a best score of 0.1 (player 2)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0.1);
            })
            ;
    });


    it('should have reversed the position on the leads', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const leadsFound = res.body;
                expect(leadsFound).to.have.lengthOf(2);

                const lead1found = leadsFound[0];
                expect(lead1found.rank).to.be.eql(1);
                expect(lead1found.player_name).to.be.eql(player2data.merge.name);
                expect(lead1found.score).to.be.eql(0.1);

                const lead2found = leadsFound[1];
                expect(lead2found.rank).to.be.eql(2);
                expect(lead2found.player_name).to.be.eql(player1data.merge.name);
                expect(lead2found.score).to.be.eql(0.2);
            })
        ;
    });
});
