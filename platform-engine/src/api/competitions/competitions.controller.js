'use strict';

const
    Promise = require('bluebird'),
    {
        Controller,
        ConflictError,
        ResourceNotFoundError,
        BadRequestError,
        AccessDeniedError,
    } = require('../../common/controller'),
    {
        competitionsController,
        CompetitionNotFoundError,
        CompetitionWrongPasswordError,
        CompetitionNotOpenedError,
        CompetitionValidationError,
        CompetitionAlreadyRegisteredError,
    } = require('../../model/competitions/competitions.controller');



class CompetitionsController extends Controller {

    getAllCompetitions(req, res) {
        const
            playerSub = req.user.sub,
            viewAll = req.admin;

        return competitionsController
            .getAllCompetitions(playerSub, viewAll)
            .then((competitions) => {
                this.sendData(res, competitions);
            })
        ;
    }


    getCompetitionById(req, res) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.user.sub,
            viewAll = req.admin;

        let fields;
        if (req.query.fields &&
            req.query.fields.length > 0) {
            fields = req.query.fields.split(',');
        }
        else {
            fields = [];
        }

        return competitionsController
            .getCompetitionById(competitionId, playerSub, fields, viewAll)
            .then((competition) => {
                this.sendData(res, competition);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    getCompetitionRulesById(req, res) {
        const
            competitionId = req.params.competitionId,
            viewAll = req.admin;

        return competitionsController
            .getCompetitionRulesById(competitionId, viewAll)
            .then((competition) => {
                this.sendData(res, competition);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    getCompetitionLeaderboardInfosById(req, res) {
        const
            competitionId = req.params.competitionId,
            viewAll = req.admin;

        return competitionsController
            .getCompetitionLeaderboardInfosById(competitionId, viewAll)
            .then((competition) => {
                this.sendData(res, competition);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    createCompetition(req, res) {
        const competitionRaw = req.body;

        return competitionsController
            .createCompetition(competitionRaw)
            .then((competition) => {
                this.sendDataCreated(res, competition);
            })
            .catch(CompetitionValidationError, (err) => {
                throw new BadRequestError(err.message);
            })
        ;
    }


    updateCompetition(req, res) {
        const
            competitionId = req.params.competitionId,
            competitionRaw = req.body;

        return competitionsController
            .updateCompetition(competitionId, competitionRaw)
            .then((competition) => {
                this.sendData(res, competition);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
            .catch(CompetitionValidationError, (err) => {
                throw new BadRequestError(err.message);
            })
        ;
    }


    canAccessToCompetition(req, res, next) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.user.sub;

        return competitionsController
            .isRegisteredToCompetition(competitionId, playerSub)
            .then((canAccess) => {
                if (!canAccess) {
                    res.status(403).send('Cannot access to competition');
                    return;
                }

                return next();
            })
        ;
    }


    canAccessToCompetitionOrAdmin(req, res, next) {
        let canAccessPromise;
        if (req.admin) {
            canAccessPromise = Promise.resolve(true);
        }
        else {
            const
                competitionId = req.params.competitionId,
                playerSub = req.user.sub;

            canAccessPromise = competitionsController.isRegisteredToCompetition(competitionId, playerSub);
        }

        return canAccessPromise
            .then((canAccess) => {
                if (!canAccess) {
                    res.status(403).send('Cannot access to competition');
                    return;
                }

                return next();
            })
        ;
    }


    removeCompetitionById(req, res) {
        const competitionId = req.params.competitionId;

        return competitionsController
            .removeCompetitionById(competitionId)
            .then(() => {
                this.sendNoData(res);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    registerCompetition(req, res) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.user.sub,
            password = req.body.password,
            viewAll = req.admin;

        return competitionsController
            .registerCompetition(competitionId, playerSub, password, viewAll)
            .then(() => {
                this.sendNoData(res);
            })
            .catch(CompetitionAlreadyRegisteredError, (err) => {
                throw new ConflictError(err.message);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
            .catch(CompetitionWrongPasswordError, (err) => {
                throw new AccessDeniedError(err.message);
            })
            .catch(CompetitionWrongPasswordError, (err) => {
                throw new AccessDeniedError(err.message);
            })
            .catch(CompetitionNotOpenedError, (err) => {
                throw new AccessDeniedError(err.message);
            })
        ;
    }


    unregisterCompetition(req, res) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.user.sub,
            viewAll = req.admin;

        return competitionsController
            .unregisterCompetition(competitionId, playerSub, viewAll)
            .then(() => {
                this.sendNoData(res, {});
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    getAllPlayers(req, res) {
        const
            competitionId = req.params.competitionId,
            search = req.query.search,
            offset = parseInt(req.query.offset) || void 0,
            limit = parseInt(req.query.limit) || void 0;

        return competitionsController
            .getAllPlayers(competitionId, search, offset, limit)
            .spread((players, totalCount) => {
                res.set('total-count', totalCount);

                this.sendData(res, players);
            })
        ;
    }


    allowLeaderboard(req, res) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.params.playerSub;

        return competitionsController
            .toggleLeaderboard(competitionId, playerSub, true)
            .then(() => {
                this.sendNoData(res);
            })
        ;
    }


    forbidLeaderboard(req, res) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.params.playerSub;

        return competitionsController
            .toggleLeaderboard(competitionId, playerSub, false)
            .then(() => {
                this.sendNoData(res);
            })
        ;
    }
}



////////////

module.exports = new CompetitionsController();
