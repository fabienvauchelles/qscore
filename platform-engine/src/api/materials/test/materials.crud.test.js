'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    fs = require('fs'),
    {expect} = require('chai'),
    path = require('path');


const
    config = require('../../../config'),
    {request, requestPlayer, requestPlayerAdmin, signPlayer, testHooksCleanInit, playersData, competitionsData} = require('../../../../test');



describe('Materials - CRUD', function test() {
    this.timeout(config.test.timeout);

    const playerData = _.merge({}, playersData[0]);

    const competitionData = _.merge({}, competitionsData[0]);

    const data = {
        players: [playerData],
        competitions: [competitionData],
        files: [
            {filename: 'my data filename number 1.txt'},
            {filename: 'my data filename number 2.txt'},
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


    it('should not have access to materials', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should not submit to an invalid competition', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: 'api/competitions/00000000-0000-0000-0000-000000000000/materials',
            formData: {
                filename: data.files[0].filename,
                datafile: fs.createReadStream(path.join(__dirname, 'data_1.csv')),
            },
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(403);
            })
        ;
    });


    it('should register to a competition', () => {
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


    it('should have no material', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                expect(res.body).to.be.an('array').that.is.empty;
            })
        ;
    });


    it('should not get a material file', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer({
            sub: playerData.base.sub,
            scope: '',
        });

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials/00000000-0000-0000-0000-000000000000`,
            qs: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(404);
            })
        ;
    });


    it('should not submit a material file a name full of empty spaces', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competitions[0].id}/materials`,
            formData: {
                filename: '      ',
                datafile: fs.createReadStream(path.join(__dirname, 'data_1.csv')),
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(400);
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

                const materialFound = materialsFound[0];
                expect(materialFound.id).to.be.equals(material.id);
                expect(materialFound.filename).to.be.equals(material.filename);
            })
    });


    it('should get 1 material file', () => {
        this.timeout(config.test.timeout);

        const token = signPlayer({
            sub: playerData.base.sub,
            scope: '',
        });

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials/${material.id}`,
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


    it('should submit another material file', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'POST',
            url: `api/competitions/${competitions[0].id}/materials`,
            formData: {
                filename: data.files[1].filename,
                datafile: fs.createReadStream(path.join(__dirname, 'data_2.csv')),
            },
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);
            })
        ;
    });


    it('should have 2 materials', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'GET',
            url: `api/competitions/${competitions[0].id}/materials`,
        };

        return requestPlayer(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(200);

                const materialsFound = res.body;
                expect(materialsFound).to.have.lengthOf(2);
            })
        ;
    });


    it('should remove 1 material', () => {
        this.timeout(config.test.timeout);

        const opts = {
            method: 'DELETE',
            url: `api/competitions/${competitions[0].id}/materials/${material.id}`,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(204);
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
});
