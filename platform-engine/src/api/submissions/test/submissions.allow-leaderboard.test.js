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



describe('Submissions - Allow leaderboard', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const competitionData = _.merge({}, competitionsData[0]);

    const data = {
        players: [playerData],
        competitions: [competitionData],
        submissions: [
            {comment: 'first try'},
            {comment: '4 submission with a At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat'},
        ],
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


    before('should register to a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    before('should get the registered competition with token', () => {
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


    it('should have 1 allowed player in the competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/players`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playerFound = res.body[0];
                expect(playerFound.allow_leaderboard).to.eql(true);
            })
        ;
    });


    it('should submit a valid file with score 0.1', () => {
        this.timeout(config.test.timeout);

        const formData = _.merge({
            datafile: fs.createReadStream(path.join(__dirname, 'score-010.csv')),
        }, data.submissions[0]);

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

                const submissionFound = res.body;
                expect(submissionFound.comment).to.eql(data.submissions[0].comment);
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
                expect(leadFound.score).to.be.eql(0.1);
            })
        ;
    });


    it('should allow user to submit (but he already can)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/players/${playerData.base.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should have again a lead with a 1 score of 0.1', () => {
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
                expect(leadFound.score).to.be.eql(0.1);
            })
        ;
    });


    it('should forbid user to submit', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'DELETE',
            url: `api/competitions/${competition.id}/players/${playerData.base.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should have 1 forbidden player in the competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/players`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playerFound = res.body[0];
                expect(playerFound.allow_leaderboard).to.eql(false);
            })
        ;
    });


    it('should have 1 submission with status VALID and score 0.1', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts)
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


    it('should submit a valid file with score 0.2', () => {
        this.timeout(config.test.timeout);

        const formData = _.merge({
            datafile: fs.createReadStream(path.join(__dirname, 'score-020.csv')),
        }, data.submissions[1]);

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

                const submissionFound = res.body;
                expect(submissionFound.comment).to.eql(data.submissions[1].comment);
            })
            ;
    });


    it('should wait to process submission', () => Promise.delay(config.test.submissions.wait));


    it('should have 2 submissions with status VALID and score 0.2', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const submissionsFound = res.body;
                expect(submissionsFound).to.have.lengthOf(2);

                const submissionFound = submissionsFound[0]; // Last submission
                expect(submissionFound.status).to.eql('VALID');
                expect(submissionFound.score).to.eql(0.2);
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


    it('should allow user to submit', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competition.id}/players/${playerData.base.sub}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should have 1 allowed player in the competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/players`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playerFound = res.body[0];
                expect(playerFound.allow_leaderboard).to.eql(true);
            })
        ;
    });


    it('should submit a valid file with score 0.3', () => {
        this.timeout(config.test.timeout);

        const formData = _.merge({
            datafile: fs.createReadStream(path.join(__dirname, 'score-030.csv')),
        }, data.submissions[0]);

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

                const submissionFound = res.body;
                expect(submissionFound.comment).to.eql(data.submissions[0].comment);
            })
        ;
    });


    it('should wait to process submission', () => Promise.delay(config.test.submissions.wait));


    it('should have again a lead with a 1 score of 0.3', () => {
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
                expect(leadFound.score).to.be.eql(0.3);
            })
        ;
    });
});
