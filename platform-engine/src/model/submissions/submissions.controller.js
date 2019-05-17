'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    moment = require('moment'),
    Sequelize = require('sequelize'),
    winston = require('winston');

const
    database = require('../../common/database'),
    events = require('../../common/events'),
    messaging = require('../../common/messaging'),
    {competitionsController} = require('../competitions/competitions.controller'),
    {leadsController, LeadValidationError} = require('../leads/leads.controller'),
    SubmissionModel = require('./submission/submission.model'),
    {WrongParameterError} = require('../../common/exceptions');

const
    config = require('../../config');



class SubmissionError extends Error {
    constructor(message, submissionId) {
        super(message);

        this.submissionId = submissionId;
    }
}



class SubmissionNotFoundError extends SubmissionError {
    constructor(submissionId) {
        super(`Submission ${submissionId} not found`, submissionId);
    }
}



class SubmissionTokenError extends Error {
    constructor(message, token) {
        super(message);

        this.token = token;
    }
}



class SubmissionTokenTooCloseError extends SubmissionTokenError {
    constructor(token, remainingTime) {
        super(`Submissions are too close with token ${token}`, token);

        this.remainingTime = remainingTime;
    }
}



class SubmissionTokenNotOpenedError extends SubmissionTokenError {
    constructor(token) {
        super(`Submissions are not opened with token ${token}`, token);
    }
}



class SubmissionsController {

    constructor() {}


    start(processSubmission = true) {
        winston.debug('[SubmissionsController] check submissions()');

        this._processSubmission = processSubmission;

        if (!this._processSubmission) {
            return Promise.resolve();
        }

        return this._forceAllSubmissionsProcessing()
            .catch((err) => {
                winston.error('[SubmissionsController] Cannot force submissions:', err);
            })
            .finally(() => Promise.delay(config.submissions.checkDelay))
            .then(() => this.start(this._processSubmission))
        ;
    }


    stop() {
        winston.debug('[SubmissionsController] stop()');

        this._processSubmission = false;
    }


    getAllSubmissions(competitionId, playerSub, offset = 0, limit = 10) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug(
            '[SubmissionsController] getAllSubmissions(): competitionId=', competitionId,
            '/ playerSub=', playerSub,
            '/ offset=', offset,
            '/ limit=', limit
        );

        return Promise.all([
            getPaginatedSubmissions(competitionId, playerSub, offset, limit),
            getSubmissionsCount(competitionId, playerSub),
        ]);


        ////////////

        function getPaginatedSubmissions(cId, pSub, fset, lim) {
            return SubmissionModel.findAll({
                where: {
                    player_sub: pSub,
                    competition_id: cId,
                },
                order: [
                    ['created_at', 'DESC'],
                ],
                offset: fset,
                limit: lim,
                attributes: ['id', 'status', 'score', 'comment', 'error', 'updated_at'],
            });
        }

        function getSubmissionsCount(cId, pSub) {
            return SubmissionModel.count({
                where: {
                    player_sub: pSub,
                    competition_id: cId,
                },
            });
        }
    }


    getBestSubmissionScore(competitionId, playerSub) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug(
            '[SubmissionsController] getBestSubmissionScore(): competitionId=', competitionId,
            '/ playerSub=', playerSub
        );

        return competitionsController
            .getCompetitionAttributes(competitionId, ['score_order'])
            .then((attributes) => {
                let scoreOrder;
                if (attributes.score_order) {
                    scoreOrder = 'DESC';
                }
                else {
                    scoreOrder = 'ASC';
                }

                return SubmissionModel.findAll({
                    where: {
                        player_sub: playerSub,
                        competition_id: competitionId,
                        status: 'VALID',
                    },
                    order: [
                        ['score', scoreOrder],
                    ],
                    limit: 1,
                    attributes: ['id', 'status', 'score', 'error', 'comment', 'updated_at'],
                });
            })
            .then((submissions) => {
                if (submissions.length <= 0) {
                    return 0;
                }

                return submissions[0].score;
            })
        ;
    }


    getSubmissionDataById(submissionId) {
        if (!submissionId ||
            submissionId.length <= 0) {
            return Promise.reject(new WrongParameterError('submissionId'));
        }

        winston.debug('[SubmissionsController] getSubmissionDataById(): submissionId=', submissionId);

        return SubmissionModel
            .find({
                where: {id: submissionId},
                attributes: ['datafile'],
            })
            .tap((submission) => {
                if (!submission) {
                    throw new SubmissionNotFoundError(submissionId);
                }
            })
            .then((submission) => submission.datafile)
        ;
    }


    createSubmission(token, comment, file) {
        if (!token ||
            token.length <= 0) {
            return Promise.reject(new WrongParameterError('token'));
        }

        if (!file ||
            !_.isObject(file)) {
            return Promise.reject(new WrongParameterError('file'));
        }

        winston.debug('[SubmissionsController] createSubmission(): token=', token,
            ' / comment=', comment, ' / file.length=', file.length);

        return database.transaction((transaction) =>
            competitionsController.getPlayerCompetitionByToken(token, transaction)
            .tap((pc) => {
                // Is opened ?
                const now = moment();
                if (now.isBefore(pc.competition.date_start) ||
                    now.isSameOrAfter(pc.competition.date_end)) {
                    throw new SubmissionTokenNotOpenedError(token);
                }
            })
            .tap(
                (pc) => getRemainingTime(pc.competition_id, pc.player_sub, pc.competition.submission_delay, transaction)
                    .then((remainingTime) => {
                        if (remainingTime > 0) {
                            throw new SubmissionTokenTooCloseError(token, remainingTime);
                        }
                    })
            )
            .then((pc) => {
                const payload = {
                    competition_id: pc.competition_id,
                    player_sub: pc.player_sub,
                    datafile: file.buffer,
                };

                const cComment = clean(comment);
                if (cComment) {
                    payload.comment = cComment;
                }

                return SubmissionModel.create(payload, {transaction});
            })
        )
            // Send to azure
            .tap((submission) => {
                events.emit(submission.competition_id, `submissions::${token}`, 'submissions::submitted');
            })
            .tap((submission) => this._askSubmissionProcessing(submission))
        ;


        ////////////

        function getRemainingTime(cId, pSub, delay, transaction) {
            if (delay <= 0) {
                return Promise.resolve(0);
            }

            return database.query(`
                SELECT MAX(updated_at) as updated_at_max 
                FROM submissions 
                WHERE competition_id=:competition_id AND player_sub=:player_sub AND status=:status
            `, {
                replacements: {
                    competition_id: cId,
                    player_sub: pSub,
                    status: 'VALID',
                },
                type: Sequelize.QueryTypes.SELECT,
                transaction,
            })
                .then((dt) => {
                    if (!dt || dt.length <= 0) {
                        return 0;
                    }

                    const
                        latest = moment(dt[0].updated_at_max),
                        now = moment();

                    latest.add(delay, 'ms');

                    return latest.diff(now);
                })
            ;
        }

        function clean(a) {
            if (!a) {
                return;
            }

            return a.toString().trim();
        }
    }


    updateSubmissionValid(submissionId, score) {
        if (!submissionId ||
            submissionId.length <= 0) {
            return Promise.reject(new WrongParameterError('submissionId'));
        }

        if (!_.isNumber(score) || _.isNaN(score)) {
            return Promise.reject(new WrongParameterError('score'));
        }

        winston.debug(
            '[SubmissionsController] updateSubmissionValid(): submissionId=', submissionId, ' / score=', score
        );

        return database.transaction((transaction) =>
            SubmissionModel
                .find({
                    where: {id: submissionId},
                    attributes: {
                        exclude: ['datafile'],
                    },
                    transaction,
                })
                .tap((submission) => {
                    if (!submission) {
                        throw new SubmissionNotFoundError(submissionId);
                    }
                })
                .then((submission) => {
                    submission.score = score;
                    submission.status = 'VALID';
                    submission.error = null;
                    submission.datafile = null;

                    return submission.save({transaction});
                })
                .then((submission) => Promise.join(
                    submission,
                    competitionsController.getPlayerCompetitionBySubmission(submission)
                ))
                .tap((results) => {
                    const [submission, pc] = results;

                    if (pc.allow_leaderboard) {
                        return leadsController.createOrUpdateLeadFromSubmission(submission, pc, transaction);
                    }
                })
        )
            .tap((results) => {
                const [submission, pc] = results;

                events.emit(submission.competition_id, `submissions::${pc.id}`, 'submissions::valid', submission);
            })
            .spread((submission) => submission)
            .catch(LeadValidationError, (err) => this.updateSubmissionInvalid(submissionId, err.message))
            .catch(Sequelize.ValidationError, (err) => this.updateSubmissionInvalid(submissionId, err.message))
        ;
    }


    updateSubmissionInvalid(submissionId, message) {
        if (!submissionId ||
            submissionId.length <= 0) {
            return Promise.reject(new WrongParameterError('submissionId'));
        }

        if (!message ||
            message.length <= 0) {
            return Promise.reject(new WrongParameterError('message'));
        }

        winston.debug(
            '[SubmissionsController] updateSubmissionInvalid(): submissionId=', submissionId, ' / message=', message
        );

        return database.transaction((transaction) =>
            SubmissionModel.find({
                where: {id: submissionId},
                attributes: {
                    exclude: ['datafile'],
                },
                transaction,
            })
            .tap((submission) => {
                if (!submission) {
                    throw new SubmissionNotFoundError(submissionId);
                }
            })
            .then((submission) => {
                submission.score = null;
                submission.status = 'INVALID';
                submission.error = message;
                submission.datafile = null;

                return submission.save({transaction});
            })
        )
            .tap((submission) =>
                competitionsController.getPlayerCompetitionBySubmission(submission)
                    .then((pc) => {
                        events.emit(
                            submission.competition_id,
                            `submissions::${pc.id}`,
                            'submissions::invalid',
                            submission
                        );
                    })
            )
        ;
    }


    _forceAllSubmissionsProcessing() {
        return SubmissionModel
            .findAll({
                where: {
                    status: 'SUBMITTED',
                    updated_at: {
                        [Sequelize.Op.lt]: new Date(new Date() - config.submissions.retryDelay),
                    },
                    retry: {
                        [Sequelize.Op.lt]: config.submissions.maxRetries,
                    },
                },
                attributes: {
                    exclude: ['datafile'],
                },
            })
            .then((submissions) => Promise.mapSeries(submissions,
                (submission) => this._askSubmissionProcessing(submission)
            ))
        ;
    }


    _askSubmissionProcessing(submission) {
        return submission
            .getCompetition()
            .then((competition) => {
                submission.retry = submission.retry + 1;

                return Promise.all([
                    submission.save(),

                    messaging.publish(competition.scorer_class, submission.id),
                ]);
            })
        ;
    }
}



////////////

module.exports = {
    submissionsController: new SubmissionsController(),
    SubmissionError,
    SubmissionNotFoundError,
    SubmissionTokenError,
    SubmissionTokenTooCloseError,
    SubmissionTokenNotOpenedError,
};
