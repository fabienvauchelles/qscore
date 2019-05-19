'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    fs = require('fs'),
    {expect} = require('chai'),
    path = require('path'),
    zlib = require('zlib');


const
    config = require('../../../config'),
    {request, requestPlayer, requestPlayerAdmin, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Submissions - Compression', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const competitionData = _.merge({}, competitionsData[0]);

    const data = {
        players: [playerData],
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


    // Uncompressed file - GZIP type

    it('should not submit a uncompressed file with the GZIP type', () => {
        this.timeout(config.test.timeout);

        const
            pathfile = path.join(__dirname, 'score-010.csv'),
            datafile = fs.createReadStream(pathfile);

        datafile.path = pathfile;

        const formData = _.merge({
            datafile,
            compression: 'gzip',
        });

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
                expect(res.statusCode).to.eql(400);
            })
        ;
    });


    // Valid compressed file - No type

    it('should submit a compressed file with no type', () => {
        this.timeout(config.test.timeout);

        const
            pathfile = path.join(__dirname, 'score-010.csv'),
            datafile = fs.createReadStream(pathfile).pipe(zlib.createGzip());

        datafile.path = pathfile;

        const formData = _.merge({datafile});

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


    it('should have a an INVALID submission (compressed file, no type)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const submissionFound = res.body[0]; // Last submission
                expect(submissionFound.status).to.eql('INVALID');
            })
            ;
    });


    // compressed file - GZIP type

    it('should submit a compressed file with GZIP type', () => {
        this.timeout(config.test.timeout);

        const
            pathfile = path.join(__dirname, 'score-010.csv'),
            datafile = fs.createReadStream(pathfile).pipe(zlib.createGzip());

        datafile.path = pathfile;

        const formData = _.merge({
            datafile,
            compression: 'gzip',
        });

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


    it('should have a a VALID submission (valid compressed file, valid type)', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competition.id}/submissions`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const submissionFound = res.body[0];
                expect(submissionFound.score).to.eql(0.1);
            })
        ;
    });
});
