'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {playersData, request, signPlayer, testHooksClean} = require('../../../../test');



describe('Players - validation', function test() {
    this.timeout(config.test.timeout);

    testHooksClean();

    const playerData = _.merge({}, playersData[0]);


    it('should not create a player with wrong picture URL', () => {
        this.timeout(config.test.timeout);

        const newData = _.merge({}, playerData, {
            picture_url: 'this is not an url',
        });

        const token = signPlayer(newData);

        const opts = {
            method: 'POST',
            url: 'api/players/me',
            json: {token},
        };

        return request(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(400);
            })
        ;
    });


    [
        'name', 'email',
    ].forEach((field) => {
        it(`should not create a player with ${field} empty`, () => {
            this.timeout(config.test.timeout);

            const newData = _.merge({}, playerData);
            delete newData[field];

            const token = signPlayer(newData);

            const opts = {
                method: 'POST',
                url: 'api/players/me',
                json: {token},
            };

            return request(opts)
                .then((res) => {
                    expect(res.statusCode).to.eql(400);
                })
            ;
        });


        it(`should not create a player with ${field} full of spaces`, () => {
            this.timeout(config.test.timeout);

            const newData = _.merge({}, playerData);
            newData[field] = '               ';

            const token = signPlayer(newData);

            const opts = {
                method: 'POST',
                url: 'api/players/me',
                json: {token},
            };

            return request(opts)
                .then((res) => {
                    expect(res.statusCode).to.eql(400);
                })
            ;
        });
    });
});
