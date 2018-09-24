'use strict';

const
    express = require('express');

const
    authService = require('../../common/auth-service'),
    leadsController = require('./leads.controller');



const router = express.Router({mergeParams: true});

router.use(authService.getJwtPlayer());


// GET /leads/:competitionId
router.get(
    '/:competitionId',
    leadsController.getAllLeads
);



////////////

module.exports = router;
