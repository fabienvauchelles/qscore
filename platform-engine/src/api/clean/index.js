'use strict';

const
    express = require('express');

const
    authService = require('../../common/auth-service'),
    cleanController = require('./clean.controller');

const
    config = require('../../config');



const router = express.Router();

// To avoid deleting the entire database by mistake
// this path is only activated in test environment.
if (config.node_env === 'test') {

    // DELETE /
    router.delete(
        '/',
        authService.checkJwtAdmin(),
        cleanController.clean
    );
}


////////////

module.exports = router;
