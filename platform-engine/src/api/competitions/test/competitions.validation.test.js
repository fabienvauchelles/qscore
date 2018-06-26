'use strict';

/* eslint-disable no-unused-expressions */

const
    _ = require('lodash'),
    {expect} = require('chai');


const
    config = require('../../../config'),
    {requestPlayerAdmin, testHooksClean, competitionsData} = require('../../../../test');



describe('Competitions - validation', function test() {
    this.timeout(config.test.timeout);

    testHooksClean();

    const competitionData = _.merge({}, competitionsData[0]);


    it('should not create a competition with wrong picture URL', () => {
        this.timeout(config.test.timeout);

        const newData = _.merge({}, competitionData, {
            picture_url: 'this is not an url',
        });

        const opts = {
            method: 'POST',
            url: 'api/competitions',
            json: newData,
        };

        return requestPlayerAdmin(opts)
            .then((res) => {
                expect(res.statusCode).to.eql(400);
            })
        ;
    });


    [
        'title', 'title_short', 'scorer_class',
        'description', 'description_short',
        'eval_metric', 'eval_format', 'rules',
        'materials_description',
    ].forEach((field) => {
        it(`should not create a competition with ${field} empty`, () => {
            this.timeout(config.test.timeout);

            const newData = _.merge({}, competitionData);
            delete newData[field];

            const opts = {
                method: 'POST',
                url: 'api/competitions',
                json: newData,
            };

            return requestPlayerAdmin(opts)
                .then((res) => {
                    expect(res.statusCode).to.eql(400);
                })
                ;
        });


        it(`should not create a competition with ${field} full of spaces`, () => {
            this.timeout(config.test.timeout);

            const newData = _.merge({}, competitionData);
            newData[field] = '               ';

            const opts = {
                method: 'POST',
                url: 'api/competitions',
                json: newData,
            };

            return requestPlayerAdmin(opts)
                .then((res) => {
                    expect(res.statusCode).to.eql(400);
                })
            ;
        });
    });
});
