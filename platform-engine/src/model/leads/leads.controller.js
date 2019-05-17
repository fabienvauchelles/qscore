'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    crypto = require('crypto'),
    Sequelize = require('sequelize'),
    winston = require('winston');

const
    database = require('../../common/database'),
    events = require('../../common/events'),
    LeadModel = require('./lead/lead.model'),
    PlayerModel = require('../players/player/player.model'),
    {competitionsController, CompetitionNotFoundError} = require('../competitions/competitions.controller'),
    {WrongParameterError} = require('../../common/exceptions');


class LeadError extends Error {
    constructor(message, competitionId) {
        super(message);

        this.competitionId = competitionId;
    }
}



class LeadNotFoundError extends LeadError {
    constructor(competitionId) {
        super(`Lead ${competitionId} not found`, competitionId);
    }
}


class LeadNotAllowedError extends LeadError {
    constructor(competitionId) {
        super(`Lead ${competitionId} not allowed`, competitionId);
    }
}



class LeadValidationError extends Error {
    constructor(message) {
        super(`Lead validation error: ${message}`);
    }
}



class LeadsController {

    constructor() {}


    getAllLeads(competitionId, admin, offset = 0, limit = 10) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        winston.debug('[LeadsController] getAllLeads(): competitionId=', competitionId,
            '/ offset=', offset,
            '/ limit=', limit);

        return competitionsController
            .getCompetitionAttributes(competitionId, ['score_order', 'leaderboard_hidden', 'register_strategy_type'])
            .then((attributes) => {
                if (attributes.leaderboard_hidden && !admin) {
                    throw new LeadNotAllowedError(competitionId);
                }

                return Promise.join(
                    getPaginatedLeads(competitionId, attributes.score_order, offset, limit),
                    getLeadsCount(competitionId),
                    attributes.register_strategy_type
                );
            })
            .catch(CompetitionNotFoundError, () => {
                throw new LeadNotFoundError(competitionId);
            })
        ;


        ////////////

        function createHash(text) {
            return crypto
                .createHash('sha256')
                .update(text)
                .digest('hex');
        }

        function getPaginatedLeads(cId, order, fset, lim) {
            let scoreOrder;
            if (order) {
                scoreOrder = 'DESC';
            }
            else {
                scoreOrder = 'ASC';
            }

            return LeadModel.findAll({
                where: {
                    competition_id: cId,
                },
                attributes: ['player_sub', 'player_location', 'score', 'score_updated_at', 'submissions_count'],
                order: [
                    ['score', scoreOrder],
                    ['score_updated_at', 'ASC'],
                ],
                offset: fset,
                limit: lim,
                include: [
                    {
                        model: PlayerModel,
                        required: true,
                        attributes: ['name', 'picture_url'],
                    },
                ],
            })
                .then((leads) => leads.map((l, idx) => {
                    const lObj = l.toJSON();

                    lObj.hash = createHash(lObj.player_sub);
                    delete lObj.player_sub;

                    lObj.player_name = lObj.player.name;
                    lObj.player_picture_url = lObj.player.picture_url;
                    delete lObj.player;

                    lObj.rank = idx + 1 + fset;

                    return lObj;
                }))
            ;
        }

        function getLeadsCount(cId) {
            return LeadModel.count({
                where: {
                    competition_id: cId,
                },
            });
        }
    }


    getPlayerRank(competitionId, playerSub) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug('[LeadsController] getPlayerRank(): competitionId=', competitionId, ' / playerSub=', playerSub);

        return Promise
            .all([
                getRank(competitionId, playerSub),
                competitionsController.getPlayersCount(competitionId),
            ])
            .spread((rank, total) => ({rank, total}))
        ;


        ////////////

        function getRank(cId, pSub) {
            return competitionsController
                .getCompetitionAttributes(cId, ['score_order'])
                .then((attributes) => database.query(`
select rank
from (
    select player_sub, rank() over (order by score ${attributes.score_order ? 'DESC': 'ASC'}, score_updated_at ) as rank 
    from leads 
    where competition_id = :competitionId
) as ranked
where player_sub=:playerSub
`,
                        {
                            replacements: {
                                competitionId: cId,
                                playerSub: pSub,
                            },
                            type: Sequelize.QueryTypes.SELECT,
                        }
                    )
                )
                .then((results) => {
                    if (results.length <= 0) {
                        return;
                    }

                    return results[0].rank;
                })
            ;
        }
    }


    createOrUpdateLeadFromSubmission(submission, pc, transaction) {
        if (!submission ||
            !_.isObject(submission)) {
            return Promise.reject(new WrongParameterError('submission'));
        }

        if (!pc ||
            !_.isObject(pc)) {
            return Promise.reject(new WrongParameterError('pc'));
        }

        if (!transaction ||
            !_.isObject(transaction)) {
            return Promise.reject(new WrongParameterError('transaction'));
        }

        winston.debug('[LeadsController] createOrUpdateLeadFromSubmission(): submission.id=', submission.id);

        return competitionsController
            .getCompetitionAttributes(submission.competition_id, ['score_order'])
            .then((attributes) => LeadModel
                .find({
                    where: {
                        player_sub: submission.player_sub,
                        competition_id: submission.competition_id,
                    },
                    transaction,
                })
                .then((lead) => {
                    if (lead) {
                        if (attributes.score_order) {
                            if (submission.score > lead.score) {
                                lead.score = submission.score;
                                lead.score_updated_at = new Date();
                            }
                        }
                        else {
                            if (submission.score < lead.score) {
                                lead.score = submission.score;
                                lead.score_updated_at = new Date();
                            }
                        }

                        lead.player_location = pc.player_location;
                        lead.submissions_count++;

                        return lead.save({transaction});
                    }
                    else {
                        return LeadModel.create({
                            player_sub: submission.player_sub,
                            player_location: pc.player_location,
                            competition_id: submission.competition_id,
                            score: submission.score,
                            score_updated_at: new Date(),
                            submissions_count: 1,
                        }, {transaction});
                    }
                })
                .tap(() => {
                    events.emit(submission.competition_id, 'leaderboard', 'leaderboard::updated');
                })
            )
            .catch(Sequelize.ValidationError, (err) => {
                throw new LeadValidationError(err.message);
            })
        ;
    }


    removeLeads(competitionId, playerSub, transaction) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        if (!transaction ||
            !_.isObject(transaction)) {
            return Promise.reject(new WrongParameterError('transaction'));
        }

        winston.debug('[LeadsController] removeLeads(): competitionId=', competitionId, ' / playerSub=', playerSub);

        return LeadModel
            .destroy({
                where: {
                    player_sub: playerSub,
                    competition_id: competitionId,
                },
            }, {transaction})
            .tap(() => {
                events.emit(competitionId, 'leaderboard', 'leaderboard::updated');
            })
        ;
    }
}


////////////

module.exports = {
    leadsController: new LeadsController(),
    LeadError,
    LeadNotFoundError,
    LeadNotAllowedError,
    LeadValidationError,
};
