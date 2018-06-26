'use strict';

const
    express = require('express');

const
    authService = require('../../common/auth-service'),
    playersController = require('./players.controller');



const router = express.Router({mergeParams: true});


// POST /me
router.post(
    '/me',
    playersController.registerMe
);


// GET / (admin)
router.get(
    '/',
    authService.checkJwtPlayer(),
    authService.isAdmin(),
    playersController.getAllPlayers
);

// GET /:sub (admin)
router.get(
    '/:playerSub',
    authService.checkJwtPlayer(),
    authService.isAdmin(),
    playersController.getPlayerBySub
);

// DELETE /:sub (admin)
router.delete(
    '/:playerSub',
    authService.checkJwtPlayer(),
    authService.isAdmin(),
    playersController.removePlayerBySub
);


////////////

module.exports = router;
