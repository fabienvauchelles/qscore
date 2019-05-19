'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    fs = require('fs'),
    {expect} = require('chai'),
    moment = require('moment'),
    path = require('path');


const
    config = require('../../../config'),
    {request, requestPlayer, requestPlayerAdmin, signPlayer, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Materials - Release at', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const competitionData = _.merge({}, competitionsData[0]);

    const data = {
        players: [playerData],
        competitions: [competitionData],
        files: [
            {filename: 'my data filename number 1.txt'},
        ],
    };

    testHooksCleanInit(data);

    let competitions;
    before('should get all competitions', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: 'api/competitions',
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                competitions = res.body;
            })
        ;
    });


    before('should register to a competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competitions[0].id}/register`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
            })
        ;
    });


    let material;
    it('should submit a material file', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competitions[0].id}/materials`,
            formData: {
                filename: data.files[0].filename,
                datafile: fs.createReadStream(path.join(__dirname, 'data_1.csv')),
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                material = res.body;
                expect(material.id).to.be.a('string');
                expect(material.filename).to.be.equals(data.files[0].filename);
            })
        ;
    });


    it('should have 1 material', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const materialsFound = res.body;
                expect(materialsFound).to.have.lengthOf(1);
            })
        ;
    });


    it('should download 1 material file', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer({
            sub: playerData.base.sub,
            scope: '',
        });

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials/${material.id}/download`,
            qs: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
                expect(res.headers['content-disposition']).to.be.equals(`attachment; filename=${material.filename}`);

                const fileContent = fs.readFileSync(path.join(__dirname, 'data_1.csv')).toString();
                expect(res.body).to.be.equals(fileContent);
            })
        ;
    });


    it('should add a future release_at to a material', () => {
        this.timeout(config.test.timeout);

        const futureDate = moment()
            .add(1, 'd')
            .toDate();

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competitions[0].id}/materials/${material.id}`,
            json: {
                release_at: futureDate,
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should have no material', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const materialsFound = res.body;
                expect(materialsFound).to.have.lengthOf(0);
            })
        ;
    });


    it('should not download any material file', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer({
            sub: playerData.base.sub,
            scope: '',
        });

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials/${material.id}/download`,
            qs: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(404);
            })
        ;
    });


    it('should add a previous release_at to a material', () => {
        this.timeout(config.test.timeout);

        const futureDate = moment()
            .add(-1, 'd')
            .toDate();

        const opts = {
            method: 'PUT',
            url: `api/competitions/${competitions[0].id}/materials/${material.id}`,
            json: {
                release_at: futureDate,
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should have 1 material', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const materialsFound = res.body;
                expect(materialsFound).to.have.lengthOf(1);
            })
            ;
    });


    it('should download 1 material file', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer({
            sub: playerData.base.sub,
            scope: '',
        });

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials/${material.id}/download`,
            qs: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
                expect(res.headers['content-disposition']).to.be.equals(`attachment; filename=${material.filename}`);

                const fileContent = fs.readFileSync(path.join(__dirname, 'data_1.csv')).toString();
                expect(res.body).to.be.equals(fileContent);
            })
            ;
    });
});
