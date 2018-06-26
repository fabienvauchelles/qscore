'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {requestPlayerAdmin, testHooksClean, competitionsData} = require('../../../../test');



describe('Competitions - admin', function test() {
    this.timeout(config.test.timeout);

    testHooksClean();

    let competition;

    const competitionData = _.merge({}, competitionsData[0]);


    it('should have no competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionsFound = res.body;

                expect(competitionsFound).to.be.an('array').that.is.empty;
            })
        ;
    });


    it('should not get an unexisting competitions', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions/00000000-0000-0000-0000-000000000000',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(404);
            })
        ;
    });


    it('should create a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: 'api/competitions',
            json: competitionData,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(201);

                competition = res.body;

                expect(competition.id).to.be.a('string');
                expect(
                    _.omit(competition, ['id', 'created_at', 'updated_at'])
                ).to.deep.equal(competitionData);
            })
        ;
    });


    it('should get an existing competition with all fields', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                expect(competitionFound).to.deep.equals(competition);
            })
        ;
    });


    it('should get an existing competition with a subset of fields', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}`,
            qs: {
                fields: ['title_short', 'description_short'].join(','),
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionFound = res.body;

                expect(competitionFound.id).to.eql(competition.id);
                expect(competitionFound.title_short).to.eql(competition.title_short);
                expect(competitionFound.description_short).to.eql(competition.description_short);
                expect(competitionFound.title).to.be.undefined;
                expect(competitionFound.description).to.be.undefined;
            })
        ;
    });


    it('should get an existing competition with rules', () => {
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


    it('should get an existing competition with leaderboard infos', () => {
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


    it('should update a competition', () => {
        this.timeout(config.test.timeout);

        const competitionNewData = {
            title: 'This is test competition',
            published: false,
        };
        _.merge(competitionData, competitionNewData);

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competition.id}`,
            json: competitionNewData,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competition = res.body;

                expect(competition.id).to.be.a('string');
                expect(
                    _.omit(competition, ['id', 'created_at', 'updated_at'])
                ).to.deep.equal(competitionData);
            })
            ;
    });


    it('should remove a competition', () => {
        this.timeout(config.test.timeout);


        const opts = {
            method: 'DELETE',
            url: `api/competitions/${competition.id}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    it('should have no competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const competitionsFound = res.body;

                expect(competitionsFound).to.be.an('array').that.is.empty;
            })
        ;
    });
});
