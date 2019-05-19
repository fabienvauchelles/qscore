'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    Sequelize = require('sequelize'),
    winston = require('winston');

const
    CompetitionModel = require('./competition/competition.model'),
    database = require('../../common/database'),
    PlayerModel = require('../players/player/player.model'),
    PlayerCompetitionModel = require('../players/competition/player-competition.model'),
    {loadRegisterStrategy} = require('./register-strategy'),
    {WrongParameterError} = require('../../common/exceptions');



class CompetitionError extends Error {
    constructor(message, competitionId) {
        super(message);

        this.competitionId = competitionId;
    }
}



class CompetitionNotFoundError extends CompetitionError {
    constructor(competitionId) {
        super(`Competition ${competitionId} not found`, competitionId);
    }
}



class CompetitionValidationError extends Error {
    constructor(message) {
        super(`Competition validation error: ${message}`);
    }
}



class CompetitionAlreadyRegisteredError extends CompetitionError {
    constructor(competitionId, playerSub) {
        super(`Player ${playerSub} has already register to competition ${competitionId}`, competitionId);

        this.playerSub = playerSub;
    }
}


class CompetitionTokenNotFoundError extends Error {
    constructor(token) {
        super(`Cannot find any competition with token ${token}`);

        this.token = token;
    }
}



const
    _FIELDS_ADMIN = _.keys(CompetitionModel.attributes),
    _FIELDS_ONE = _.difference(_FIELDS_ADMIN, [
        'created_at', 'updated_at', 'scorer_class', 'register_strategy', 'hidden',
    ]),
    _FIELDS_ALL = _.difference(_FIELDS_ONE, [
        'description', 'eval_metric', 'eval_format',
        'rules', 'materials_description',
    ]);



class CompetitionsController {

    constructor() {}

    get FIELDS_ADMIN() {
        return _FIELDS_ADMIN;
    }

    get FIELDS_ONE() {
        return _FIELDS_ONE;
    }

    get FIELDS_ALL() {
        return _FIELDS_ALL;
    }


    getAllCompetitions(playerSub, viewAll = false) {
        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug(
            '[CompetitionsController] getAllCompetitions(): playerSub=', playerSub,
            ' / viewAll=', viewAll
        );

        const opts = {
            where: {},
            include: [
                {
                    model: PlayerCompetitionModel,
                    attributes: ['id', 'allow_leaderboard', 'player_location'],
                    where: {player_sub: playerSub},
                    required: false,
                },
            ],
            order: [
                ['date_start', 'DESC'],
                ['title'],
            ],
        };

        if (viewAll) {
            // Admin
            return CompetitionModel
                .findAll(opts)
                .then((competitions) => competitions.map((c) => this._convertCompetitionToJson(c)))
            ;
        }
        else {
            // Player
            opts.where.published = true;
            opts.attributes = this.FIELDS_ALL.concat(['hidden']);

            return CompetitionModel.findAll(opts)
                .then((competitions) => competitions.map((c) => this._convertCompetitionToJson(c)))
                .then((competitions) => competitions
                    .filter((c) => !c.hidden || c.token)
                    .map((c) => {
                        delete c.hidden;

                        return c;
                    })
                )
            ;
        }
    }


    getCompetitionById(competitionId, playerSub, fields = [], viewAll = false) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        if (!_.isArray(fields)) {
            return Promise.reject(new WrongParameterError('fields'));
        }

        winston.debug(
            '[CompetitionsController] getCompetitionById(): competitionId=', competitionId,
            ' / playerSub=', playerSub,
            ' / fields=', fields.join(','),
            ' / viewAll=', viewAll
        );

        const opts = {
            where: {
                id: competitionId,
            },
            include: [
                {
                    model: PlayerCompetitionModel,
                    attributes: ['id', 'allow_leaderboard', 'player_location'],
                    where: {player_sub: playerSub},
                    required: false,
                },
            ],
        };
        if (!viewAll) {
            opts.where.published = true;

            if (fields.length > 0) {
                opts.attributes = fields.filter((f) => this.FIELDS_ONE.indexOf(f) >= 0);
            }
            else {
                opts.attributes = this.FIELDS_ONE;
            }
        }
        else if (fields.length > 0) {
            opts.attributes = fields.filter((f) => this.FIELDS_ADMIN.indexOf(f) >= 0);
        }

        if (opts.attributes &&
            opts.attributes.length > 0 &&
            opts.attributes.indexOf('id') < 0) {
            opts.attributes.push('id');
        }

        return CompetitionModel.find(opts)
            .then((competition) => {
                if (!competition) {
                    throw new CompetitionNotFoundError(competitionId);
                }

                return this._convertCompetitionToJson(competition);
            })
        ;
    }


    getCompetitionRulesById(competitionId, viewAll = false) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        winston.debug(
            '[CompetitionsController] getCompetitionRulesById(): competitionId=', competitionId,
            ' / viewAll=', viewAll
        );

        const opts = {
            where: {
                id: competitionId,
            },
            attributes: ['id', 'title', 'picture_url', 'rules', 'register_strategy_type'],
        };

        if (!viewAll) {
            opts.where.published = true;
        }

        return CompetitionModel.find(opts)
            .tap((competition) => {
                if (!competition) {
                    throw new CompetitionNotFoundError(competitionId);
                }
            })
        ;
    }


    getCompetitionLeaderboardInfosById(competitionId, viewAll = false) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        winston.debug(
            '[CompetitionsController] getCompetitionLeaderboardInfosById(): competitionId=', competitionId,
            ' / viewAll=', viewAll
        );

        const opts = {
            where: {
                id: competitionId,
            },
            attributes: [
                'id', 'title', 'picture_url', 'date_start', 'date_end',
                'leaderboard_html', 'leaderboard_css', 'leaderboard_js',
            ],
        };

        if (!viewAll) {
            opts.where.published = true;
        }

        return CompetitionModel.find(opts)
            .tap((competition) => {
                if (!competition) {
                    throw new CompetitionNotFoundError(competitionId);
                }
            })
        ;
    }


    getPlayerCompetitionByToken(token, transaction) {
        if (!token ||
            token.length <= 0) {
            return Promise.reject(new WrongParameterError('token'));
        }

        if (!transaction ||
            !_.isObject(transaction)) {
            return Promise.reject(new WrongParameterError('transaction'));
        }

        winston.debug('[CompetitionsController] getPlayerCompetitionByToken(): token=', token);

        return PlayerCompetitionModel.find({
            where: {
                id: token,
            },
            include: [
                {
                    model: CompetitionModel,
                    required: true,
                    attributes: ['submission_delay', 'date_start', 'date_end'],
                    where: {
                        published: true,
                    },
                },
            ],
            transaction,
        })
            .tap((pc) => {
                if (!pc) {
                    throw new CompetitionTokenNotFoundError(token);
                }
            })
        ;
    }


    getPlayerCompetitionBySubmission(submission) {
        if (!submission ||
            !_.isObject(submission)) {
            return Promise.reject(new WrongParameterError('submission'));
        }

        winston.debug('[CompetitionsController] getPlayerCompetitionBySubmission(): submission.id=', submission.id);

        return PlayerCompetitionModel.find({
            where: {
                competition_id: submission.competition_id,
                player_sub: submission.player_sub,
            },
            attributes: ['id', 'player_location', 'allow_leaderboard'],
        });
    }


    createCompetition(competitionRaw) {
        if (!competitionRaw ||
            !_.isObject(competitionRaw)) {
            return Promise.reject(new WrongParameterError('competitionRaw'));
        }

        winston.debug('[CompetitionsController] createCompetition()');

        return CompetitionModel
            .create(competitionRaw)
            .catch(Sequelize.ValidationError, (err) => {
                throw new CompetitionValidationError(err.message);
            })
        ;
    }


    updateCompetition(competitionId, competitionRaw) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!competitionRaw ||
            !_.isObject(competitionRaw)) {
            return Promise.reject(new WrongParameterError('competitionRaw'));
        }

        winston.debug('[CompetitionsController] updateCompetition(): competitionId=', competitionId);

        return database.transaction((transaction) => CompetitionModel
            .find({
                where: {
                    id: competitionId,
                },
                transaction,
            })
            .tap((competition) => {
                if (!competition) {
                    throw new CompetitionNotFoundError(competitionId);
                }
            })
            .then((competition) => {
                const competitionUpdate = _.merge(
                    {},
                    competition,
                    _.omit(competitionRaw, ['id', 'created_at', 'updated_at'])
                );

                return competition.update(competitionUpdate, {transaction});
            })
            .catch(Sequelize.ValidationError, (err) => {
                throw new CompetitionValidationError(err.message);
            })
        );
    }


    removeCompetitionById(competitionId) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        winston.debug('[CompetitionsController] removeCompetitionById(): competitionId=', competitionId);

        return database.transaction((transaction) =>
            CompetitionModel
                .find({
                    where: {
                        id: competitionId,
                    },
                    transaction,
                })
                .tap((competition) => {
                    if (!competition) {
                        throw new CompetitionNotFoundError(competitionId);
                    }
                })
                .then((competition) => competition.destroy({transaction}))
            )
        ;
    }


    registerCompetition(competitionId, playerSub, auth, viewAll = false) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug('' +
            '[CompetitionsController] registerCompetition(): competitionId=', competitionId, ' / playerSub=', playerSub,
            ' / viewAll=', viewAll)
        ;

        const where = {
            id: competitionId,
        };

        if (!viewAll) {
            where.published = true;
        }

        return database.transaction((transaction) =>
            CompetitionModel
                .find({where, transaction})
                .then((competition) => {
                    if (!competition) {
                        throw new CompetitionNotFoundError(competitionId);
                    }

                    const strategyOpts = loadRegisterStrategy(competition).register(auth, viewAll);

                    return [competition, strategyOpts];
                })
                .spread((competition, strategyOpts) => {
                    const opts = _.merge({
                        player_sub: playerSub,
                        competition_id: competitionId,
                    }, strategyOpts);

                    return PlayerCompetitionModel
                        .create(opts, {transaction})
                        .then(() => {
                            ++competition.players_count;

                            return competition.save({transaction});
                        })
                    ;
                })
                .catch(Sequelize.UniqueConstraintError, () => {
                    throw new CompetitionAlreadyRegisteredError(competitionId, playerSub);
                })
        );
    }


    unregisterCompetition(competitionId, playerSub, viewAll = false) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug('' +
            '[CompetitionsController] unregisterCompetition(): competitionId=', competitionId,
            ' / playerSub=', playerSub, ' / viewAll=', viewAll)
        ;


        const where = {
            id: competitionId,
        };

        if (!viewAll) {
            where.published = true;
        }

        return database.transaction((transaction) =>
            CompetitionModel
                .find({where, transaction})
                .tap((competition) => {
                    if (!competition) {
                        throw new CompetitionNotFoundError(competitionId);
                    }
                })
                .then((competition) => PlayerCompetitionModel.find({
                    where: {
                        player_sub: playerSub,
                        competition_id: competitionId,
                    },
                }, {transaction})
                    .then((pc) => {
                        if (!pc) {
                            return;
                        }

                        return pc.destroy({transaction})
                            .then(() => {
                                --competition.players_count;

                                return competition.save({transaction});
                            })
                        ;
                    })
                )
            )
            .catch(Sequelize.UniqueConstraintError, () => {
                throw new CompetitionAlreadyRegisteredError(competitionId, playerSub);
            })
        ;
    }


    isRegisteredToCompetition(competitionId, playerSub) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug(
            '[CompetitionsController] isRegisterToCompetition(): competitionId=', competitionId,
            ' / playerSub=', playerSub
        );

        return PlayerCompetitionModel.count({
            where: {
                competition_id: competitionId,
                player_sub: playerSub,
            },
            include: [
                {
                    model: CompetitionModel,
                    attributes: ['id'],
                    where: {published: true},
                },
            ],
        })
            .then((count) => count > 0)
        ;
    }


    getCompetitionAttributes(competitionId, attributes) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!attributes ||
            attributes.length <= 0) {
            return Promise.reject(new WrongParameterError('attributes'));
        }

        winston.debug(
            '[CompetitionsController] getCompetitionAttributes(): competitionId=', competitionId,
            ' / attributes=', attributes.join(',')
        );

        return CompetitionModel.find({
            where: {
                id: competitionId,
            },
            attributes,
        })
            .tap((competition) => {
                if (!competition) {
                    throw new CompetitionNotFoundError(competitionId);
                }
            })
            .then((competition) => _.pick(competition, attributes))
        ;
    }


    getAllPlayers(competitionId, search = '', offset = 0, limit = 10) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        winston.debug(
            '[CompetitionsController] getAllPlayers(): competitionId=', competitionId,
            '/ search=', search,
            '/ offset=', offset,
            '/ limit=', limit
        );

        return Promise.all([
            getPaginatedPlayers(competitionId, search, offset, limit),
            getPlayersCount(competitionId, search),
        ]);


        ////////////

        function getPaginatedPlayers(cId, srh, fset, lim) {
            const pattern = `%${srh}%`;

            return database.query(`
select players.*, competition.allow_leaderboard, count(s2.player_sub) as submissions_count
from players
  inner join player_competitions competition on players.sub = competition.player_sub
  left join submissions s2 on players.sub = s2.player_sub and competition.competition_id = s2.competition_id
where competition.competition_id = :competition_id and (players.name ilike :name or players.email ilike :email)
group by players.sub, competition.allow_leaderboard
order by players.name
offset :offset
limit :limit
`,
                {
                    replacements: {
                        competition_id: cId,
                        name: pattern,
                        email: pattern,
                        offset: fset,
                        limit: lim,
                    },
                    type: Sequelize.QueryTypes.SELECT,
                }
            );
        }

        function getPlayersCount(cId, srh) {
            return PlayerCompetitionModel.count({
                where: {
                    competition_id: cId,
                },
                include: [
                    {
                        model: PlayerModel,
                        required: true,
                        where: {
                            [Sequelize.Op.or]: [
                                {
                                    name: {
                                        [Sequelize.Op.iLike]: `%${srh}%`,
                                    },
                                },
                                {
                                    email: {
                                        [Sequelize.Op.iLike]: `%${srh}%`,
                                    },
                                },
                            ],
                        },
                    },
                ],
            });
        }
    }


    getPlayersCount(competitionId) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        winston.debug('[CompetitionsController] getPlayersCount(): competitionId=', competitionId);

        return PlayerCompetitionModel.count({
            where: {
                competition_id: competitionId,
            },
        });
    }


    toggleLeaderboard(competitionId, playerSub, status) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug('' +
            '[CompetitionsController] toggleLeaderboard(): competitionId=', competitionId, ' / playerSub=', playerSub,
            ' / status=', status)
        ;

        return database.transaction((transaction) =>
            PlayerCompetitionModel.find({
                where: {
                    competition_id: competitionId,
                    player_sub: playerSub,
                },
            }, {transaction})
                .then((pc) => {
                    pc.allow_leaderboard = status;

                    return pc.save({transaction});
                })
                .tap(() => {
                    if (!status) {
                        const {leadsController} = require('../leads/leads.controller');

                        return leadsController.removeLeads(competitionId, playerSub, transaction);
                    }
                })
        );
    }


    _convertCompetitionToJson(competition) {
        const cObj = competition.toJSON();
        if (cObj.player_competitions.length > 0) {
            const pc = cObj.player_competitions[0];
            cObj.token = pc.id;
            cObj.allow_leaderboard = pc.allow_leaderboard;
            cObj.player_location = pc.player_location;
        }

        delete cObj.player_competitions;

        return cObj;
    }
}



////////////

module.exports = {
    competitionsController: new CompetitionsController(),
    CompetitionError,
    CompetitionNotFoundError,
    CompetitionValidationError,
    CompetitionAlreadyRegisteredError,
    CompetitionTokenNotFoundError,
};
