'use strict';

const
    express = require('express');

const
    leadsController = require('./leads.controller');



const router = express.Router({mergeParams: true});


// GET /leads/:competitionId
router.get(
    '/:competitionId',
    leadsController.getAllLeads
);



////////////

module.exports = router;
