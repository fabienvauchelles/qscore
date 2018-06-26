'use strict';

const
    express = require('express');

const
    authService = require('../../common/auth-service'),
    competitionsController = require('./competitions.controller'),
    leadsController = require('../leads/leads.controller'),
    submissionsController = require('../submissions/submissions.controller'),
    materialsController = require('../materials/materials.controller');



const router = express.Router({mergeParams: true});

router.use(authService.checkJwtPlayer());


// GET /
router.get(
    '/',
    competitionsController.getAllCompetitions
);

// POST / (admin)
router.post(
    '/',
    authService.isAdmin(),
    competitionsController.createCompetition
);

// GET /:competitionId
router.get(
    '/:competitionId',
    competitionsController.canAccessToCompetitionOrAdmin,
    competitionsController.getCompetitionById
);

// GET /:competitionId/rules
router.get(
    '/:competitionId/rules',
    competitionsController.getCompetitionRulesById
);

// GET /:competitionId/leaderboardinfos
router.get(
    '/:competitionId/leaderboardinfos',
    competitionsController.getCompetitionLeaderboardInfosById
);

// PUT /:competitionId (admin)
router.put(
    '/:competitionId',
    authService.isAdmin(),
    competitionsController.updateCompetition
);

// DELETE /:competitionId (admin)
router.delete(
    '/:competitionId',
    authService.isAdmin(),
    competitionsController.removeCompetitionById
);

// POST /:competitionId/register
router.post(
    '/:competitionId/register',
    competitionsController.registerCompetition
);

// DELETE /:competitionId/register
router.delete(
    '/:competitionId/register',
    competitionsController.canAccessToCompetitionOrAdmin,
    competitionsController.unregisterCompetition
);

// GET /:competitionId/submissions
router.get(
    '/:competitionId/submissions',
    competitionsController.canAccessToCompetition, // Specific to player
    submissionsController.getAllSubmissions
);

// GET /:competitionId/bestsubmission
router.get(
    '/:competitionId/bestsubmission',
    competitionsController.canAccessToCompetition, // Specific to player
    submissionsController.getBestSubmissionScore
);

// GET /:competitionId/materials
router.get(
    '/:competitionId/materials',
    competitionsController.canAccessToCompetitionOrAdmin,
    materialsController.getAllMaterials
);

// GET /:competitionId/materials/:materialId
router.get(
    '/:competitionId/materials/:materialId',
    competitionsController.canAccessToCompetitionOrAdmin,
    materialsController.getMaterialById
);

// POST /:competitionId/materials (admin)
router.post(
    '/:competitionId/materials',
    authService.isAdmin(),
    materialsController.createMaterial
);

// DELETE /:competitionId/materials/:materialId (admin)
router.delete(
    '/:competitionId/materials/:materialId',
    authService.isAdmin(),
    materialsController.removeMaterialById
);

// GET /:competitionId/players (admin)
router.get(
    '/:competitionId/players',
    authService.isAdmin(),
    competitionsController.getAllPlayers
);

// GET /:competitionId/rank
router.get(
    '/:competitionId/rank',
    competitionsController.canAccessToCompetitionOrAdmin,
    leadsController.getPlayerRank
);

// POST /:competitionId/players/:playerSub
router.post(
    '/:competitionId/players/:playerSub',
    authService.isAdmin(),
    competitionsController.allowLeaderboard
);

// DELETE /:competitionId/players/:playerSub
router.delete(
    '/:competitionId/players/:playerSub',
    authService.isAdmin(),
    competitionsController.forbidLeaderboard
);

////////////

module.exports = router;
