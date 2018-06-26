'use strict';

/* eslint-disable no-unused-expressions */

const {expect} = require('chai');


const
    config = require('../../../config'),
    {request, requestAdmin, requestPlayer, requestPlayerAdmin, testHooksClean} = require('../../../../test');


const urls = [
    'POST /api/players/me',
    'GET /api/leads/00000000-0000-0000-0000-000000000000',
];


const urlsPlayer = [
    'GET /api/competitions',
    'GET /api/competitions/00000000-0000-0000-0000-000000000000/rules',
    'GET /api/competitions/00000000-0000-0000-0000-000000000000/leaderboardinfos',
    'POST /api/competitions/00000000-0000-0000-0000-000000000000/register',
];


const urlsPlayerAdmin = [
    'GET /api/players',
    'GET /api/players/someone',
    'DELETE /api/players/someone',
    'POST /api/competitions',
    'PUT /api/competitions/00000000-0000-0000-0000-000000000000',
    'DELETE /api/competitions/00000000-0000-0000-0000-000000000000',
    'POST /api/competitions/00000000-0000-0000-0000-000000000000/materials',
    'DELETE /api/competitions/00000000-0000-0000-0000-000000000000/materials/00000000-0000-0000-0000-000000000000',
    'GET /api/competitions/00000000-0000-0000-0000-000000000000/players',
    'POST /api/competitions/00000000-0000-0000-0000-000000000000/players/00000000-0000-0000-0000-000000000000',
    'DELETE /api/competitions/00000000-0000-0000-0000-000000000000/players/00000000-0000-0000-0000-000000000000',
];


const urlsAdmin = [
    'DELETE /api/clean',
    'GET /api/submissions/00000000-0000-0000-0000-000000000000/data',
    'PUT /api/submissions/00000000-0000-0000-0000-000000000000/score',
    'PUT /api/submissions/00000000-0000-0000-0000-000000000000/error',
];



testHooksClean();


const forbiddenStatus = [401, 403];

function accept(command, func) {
    const [method, url] = command.split(' '),
        opts = {method, url};

    return func(opts)
        .then((res) => {
            expect(res.statusCode).to.not.be.oneOf(forbiddenStatus);
        })
    ;
}


function decline(command, func) {
    const [method, url] = command.split(' '),
        opts = {method, url};

    return func(opts)
        .then((res) => {
            expect(res.statusCode).to.be.oneOf(forbiddenStatus);
        })
    ;
}


describe('Auth - permissions', function test() {
    urls.forEach((command) => {
        describe(command, function testUrl() {
            this.timeout(config.test.timeout);

            it('should ACCEPT without auth', () => accept(command, request));
            it('should ACCEPT with player JWT', () => accept(command, requestPlayer));
            it('should ACCEPT with player JWT + role admin', () => accept(command, requestPlayerAdmin));
            it('should ACCEPT with admin JWT', () => accept(command, requestAdmin));
        });
    });

    urlsPlayer.forEach((command) => {
        describe(command, function testUrl() {
            this.timeout(config.test.timeout);

            it('should DECLINE without auth', () => decline(command, request));
            it('should ACCEPT with player JWT', () => accept(command, requestPlayer));
            it('should ACCEPT with player JWT + role admin', () => accept(command, requestPlayerAdmin));
            it('should DECLINE with admin JWT', () => decline(command, requestAdmin));
        });
    });

    urlsPlayerAdmin.forEach((command) => {
        describe(command, function testUrl() {
            this.timeout(config.test.timeout);

            it('should DECLINE without auth', () => decline(command, request));
            it('should DECLINE with player JWT', () => decline(command, requestPlayer));
            it('should ACCEPT with player JWT + role admin', () => accept(command, requestPlayerAdmin));
            it('should DECLINE with admin JWT', () => decline(command, requestAdmin));
        });
    });

    urlsAdmin.forEach((command) => {
        describe(command, function testUrl() {
            this.timeout(config.test.timeout);

            it('should DECLINE without auth', () => decline(command, request));
            it('should DECLINE with player JWT', () => decline(command, requestPlayer));
            it('should DECLINE with player JWT + role admin', () => decline(command, requestPlayerAdmin));
            it('should DECLINE with admin JWT', () => accept(command, requestAdmin));
        });
    });
});
