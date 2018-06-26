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



describe('Submissions - 1 player', function test() {
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


    it('should not have access to submissions', () => {
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


    it('should not submit with an unknown token', () => {
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
                bearer: 'thisisanunknowntoken',
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(401);
            })
        ;
    });


    it('should get an empty list of players for this competition', () => {
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


    it('should have no submission', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const submissionsFound = res.body;

                expect(submissionsFound).to.be.an('array').that.is.empty;
            })
        ;
    });


    it('should have a best score of 0', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0);
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


    it('should get a player without submissions', () => {
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
                expect(playerFound.sub).to.be.eql(playerData.sub);
                expect(playerFound.name).to.be.eql(playerData.name);
                expect(playerFound.email).to.be.eql(playerData.email);
                expect(playerFound.picture_url).to.be.eql(playerData.picture_url);
                expect(playerFound.submissions_count).to.be.eql(0);
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


    it('should have 1 submission with status SUBMITTED', () => {
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
                expect(submissionFound.status).to.eql('SUBMITTED');
                expect(submissionFound.comment).to.eql(data.submissions[0].comment);
            })
        ;
    });


    it('should wait to process submission', () => Promise.delay(config.test.submissions.wait));


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
                expect(submissionFound.comment).to.eql(data.submissions[0].comment);
            })
        ;
    });


    it('should have a best score of 0.1', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0.1);
            })
        ;
    });


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
                expect(leadFound.player_name).to.be.eql(playerData.name);
                expect(leadFound.player_picture_url).to.be.eql(playerData.picture_url);
                expect(leadFound.score).to.be.eql(0.1);
                expect(leadFound.submissions_count).to.be.eql(1);
            })
        ;
    });


    it('should get a player with 1 submission', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/players`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playerFound = res.body[0];
                expect(playerFound.submissions_count).to.be.eql(1);
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
                expect(submissionFound.comment).to.eql(data.submissions[1].comment);
            })
        ;
    });


    it('should have a best score of 0.2', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0.2);
            })
        ;
    });


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
                expect(leadFound.player_name).to.be.eql(playerData.name);
                expect(leadFound.score).to.be.eql(0.2);
                expect(leadFound.submissions_count).to.be.eql(2);
            })
        ;
    });


    it('should get a player with 2 submissions', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/players`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playerFound = res.body[0];
                expect(playerFound.submissions_count).to.be.eql(2);
            })
        ;
    });


    it('should submit a valid file with score 0.1 (< 0.2)', () => {
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
                expect(submissionsFound).to.have.lengthOf(3);

                const submissionFound = submissionsFound[0]; // Last submission
                expect(submissionFound.status).to.eql('VALID');
                expect(submissionFound.score).to.eql(0.1);
            })
        ;
    });


    it('should have a best score of 0.2', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0.2);
            })
            ;
    });


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
                expect(leadFound.player_name).to.be.eql(playerData.name);
                expect(leadFound.score).to.be.eql(0.2);
                expect(leadFound.submissions_count).to.be.eql(3);
            })
            ;
    });


    it('should submit an invalid file', () => {
        this.timeout(config.test.timeout);

        const formData = {
            datafile: fs.createReadStream(path.join(__dirname, 'invalid-small.csv')),
            comment: '',
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


    it('should have 3 submissions with latest status INVALID', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const submissionsFound = res.body;
                expect(submissionsFound).to.have.lengthOf(4);

                const submissionFound = submissionsFound[0]; // Last submission
                expect(submissionFound.status).to.eql('INVALID');
            })
        ;
    });


    it('should have a best score of 0.2', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/bestsubmission`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body.score).to.eql(0.2);
            })
        ;
    });


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
                expect(leadFound.player_name).to.be.eql(playerData.name);
                expect(leadFound.score).to.be.eql(0.2);
                expect(leadFound.submissions_count).to.be.eql(3);
            })
        ;
    });


    it('should get a player with 4 submissions', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/players`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const playerFound = res.body[0];
                expect(playerFound.submissions_count).to.be.eql(4);
            })
        ;
    });


    it('should unpublished a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competition.id}`,
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


    it('should not submit a file to an unpublished competition', () => {
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
                bearer: competition.token,
            },
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(401);
            })
        ;
    });
});
