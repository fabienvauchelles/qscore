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



describe('Submissions - 2 players', function test() {
    this.timeout(config.test.timeout);

    const
        player1data = _.merge({}, playersData[0]),
        player2data = _.merge({}, playersData[1]);

    const competitionData = _.merge({}, competitionsData[0]);

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


    it('should have 0 player to the competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayerAdmin(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                expect(competitionFound.players_count).to.eql(0);
            })
        ;
    });


    it('should register to a competition with player 1', () => {
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
    it('should get the registered competition with token for player 1', () => {
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


    it('should have no rank (player 1)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/rank`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.rank).to.be.undefined;
                expect(res.body.total).to.eql(1);
            })
        ;
    });


    it('should have 1 player to the competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                expect(competitionFound.players_count).to.eql(1);
            })
        ;
    });


    it('should register to a competition with player 2', () => {
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
    it('should get the registered competition with token for player 2', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competitionPlayer2 = res.body;

                expect(competitionPlayer2.token).to.not.eql(competitionPlayer1.token);
            })
        ;
    });


    it('should have no rank (player 2)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/rank`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.rank).to.be.undefined;
                expect(res.body.total).to.eql(2);
            })
        ;
    });


    it('should have 2 players to the competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                expect(competitionFound.players_count).to.eql(2);
            })
        ;
    });


    it('should have no lead', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/leads/${competition.id}`,
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const leadsFound = res.body;

                expect(leadsFound).to.be.an('array').that.is.empty;
            })
        ;
    });


    it('should submit a valid file with score 0.1 (player 1)', () => {
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
                bearer: competitionPlayer1.token,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should submit a valid file with score 0.2 (player 2)', () => {
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


    it('should have 1 submission with status VALID and score 0.1 (player 1)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const submissionsFound = res.body;
                expect(submissionsFound).to.have.lengthOf(1);

                const submissionFound = submissionsFound[0];
                expect(submissionFound.status).to.eql('VALID');
                expect(submissionFound.score).to.eql(0.1);
            })
        ;
    });


    it('should have a best score of 0.1 (player 1)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0.1);
            })
        ;
    });


    it('should have a rank of 2 (player 1)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/rank`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.rank).to.eql(2);
                expect(res.body.total).to.eql(2);
            })
        ;
    });


    it('should have 1 submission with status VALID and score 0.2 (player 2)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const submissionsFound = res.body;
                expect(submissionsFound).to.have.lengthOf(1);

                const submissionFound = submissionsFound[0];
                expect(submissionFound.status).to.eql('VALID');
                expect(submissionFound.score).to.eql(0.2);
            })
        ;
    });


    it('should have a best score of 0.2 (player 2)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0.2);
            })
        ;
    });


    it('should have a rank of 1 (player 2)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/rank`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.rank).to.eql(1);
                expect(res.body.total).to.eql(2);
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
                expect(lead1found.player_name).to.be.eql(player2data.merge.name);
                expect(lead1found.player_picture_url).to.be.eql(player2data.merge.picture_url);
                expect(lead1found.player_location).to.be.null;
                expect(lead1found.score).to.be.eql(0.2);
                expect(lead1found.submissions_count).to.be.eql(1);

                const lead2found = leadsFound[1];
                expect(lead2found.rank).to.be.eql(2);
                expect(lead2found.player_name).to.be.eql(player1data.merge.name);
                expect(lead2found.player_picture_url).to.be.eql(player1data.merge.picture_url);
                expect(lead2found.player_location).to.be.null;
                expect(lead2found.score).to.be.eql(0.1);
                expect(lead2found.submissions_count).to.be.eql(1);
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


    it('should wait to process submission', () => Promise.delay(config.test.submissions.wait));


    it('should have 2 leads (same order)', () => {
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
                expect(lead1found.player_picture_url).to.be.eql(player2data.merge.picture_url);
                expect(lead1found.player_location).to.be.null;
                expect(lead1found.score).to.be.eql(0.2);
                expect(lead1found.submissions_count).to.be.eql(1);

                const lead2found = leadsFound[1];
                expect(lead2found.rank).to.be.eql(2);
                expect(lead2found.player_name).to.be.eql(player1data.merge.name);
                expect(lead2found.player_picture_url).to.be.eql(player1data.merge.picture_url);
                expect(lead2found.player_location).to.be.null;
                expect(lead2found.score).to.be.eql(0.2);
                expect(lead2found.submissions_count).to.be.eql(2);
            })
        ;
    });


    it('should submit a valid file with score 0.3 (player 1)', () => {
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
                bearer: competitionPlayer1.token,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
            ;
    });


    it('should wait to process submission', () => Promise.delay(config.test.submissions.wait));


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
                expect(lead1found.player_name).to.be.eql(player1data.merge.name);
                expect(lead1found.score).to.be.eql(0.3);

                const lead2found = leadsFound[1];
                expect(lead2found.rank).to.be.eql(2);
                expect(lead2found.player_name).to.be.eql(player2data.merge.name);
                expect(lead2found.score).to.be.eql(0.2);
            })
            ;
    });


    it('should have a rank of 1 (player 1)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/rank`,
        };

        return requestPlayer(opts, player1data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.rank).to.eql(1);
                expect(res.body.total).to.eql(2);
            })
        ;
    });


    it('should have a rank of 2 (player 2)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/rank`,
        };

        return requestPlayer(opts, player2data.base.sub)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.rank).to.eql(2);
                expect(res.body.total).to.eql(2);
            })
        ;
    });
});
