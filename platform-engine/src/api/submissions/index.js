'use strict';

const
    express = require('express');

const
    authService = require('../../common/auth-service'),
    submissionsController = require('./submissions.controller');



const router = express.Router({mergeParams: true});

// POST /
router.post(
    '/',
    authService.extractBearerOrDeny(),
    submissionsController.createSubmission
);


const routerSubmission = express.Router({mergeParams: true});

// GET /:submissionId/data (admin service)
routerSubmission.get(
    '/data',
    submissionsController.getSubmissionDataById
);

// PUT /:submissionId/score (admin service)
routerSubmission.put(
    '/score',
    submissionsController.updateSubmissionScore
);

// PUT /:submissionId/error (admin service)
routerSubmission.put(
    '/error',
    submissionsController.updateSubmissionError
);

router.use('/:submissionId', authService.checkJwtAdmin(), routerSubmission);


////////////

module.exports = router;
