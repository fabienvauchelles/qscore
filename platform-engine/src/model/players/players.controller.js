'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    Sequelize = require('sequelize'),
    winston = require('winston');

const
    database = require('../../common/database'),
    PlayerModel = require('./player/player.model'),
    {WrongParameterError} = require('../../common/exceptions');



class PlayerError extends Error {
    constructor(message, playerSub) {
        super(message);

        this.playerSub = playerSub;
    }
}



class PlayerNotFoundError extends PlayerError {
    constructor(playerSub) {
        super(`Player ${playerSub} not found`, playerSub);
    }
}



class PlayerProfileIncompleteError extends PlayerError {
    constructor(playerSub, field) {
        super(`Missing ${field} with this account. Please log with another account`, playerSub);

        this.field = field;
    }
}


class PlayerValidationError extends Error {
    constructor(message) {
        super(`Player validation error: ${message}`);
    }
}



class PlayerDuplicateError extends Error {
    constructor(message) {
        super(`Player duplicate error: ${message}`);
    }
}



class PlayersController {

    constructor() {}


    getAllPlayers(search = '', offset = 0, limit = 10) {
        winston.debug('[PlayersController] getAllPlayers(): search=', search,
            ' / offset=', offset, ' / limit=', limit);


        return Promise.all([
            getPaginatedPlayers(search, offset, limit),
            getPlayersCount(search),
        ]);


        ////////////

        function getPaginatedPlayers(srh, fset, lim) {
            const pattern = `%${srh}%`;

            return database.query(`
select players.*, count(competition.player_sub) as competitions_count
from players left join player_competitions competition on players.sub = competition.player_sub
where (players.name ilike :name or players.email ilike :email)
group by players.sub
order by players.name
offset :offset
limit :limit
`,
                {
                    replacements: {
                        name: pattern,
                        email: pattern,
                        offset: fset,
                        limit: lim,
                    },
                    type: Sequelize.QueryTypes.SELECT,
                }
            );
        }

        function getPlayersCount(srh) {
            return PlayerModel.count({
                where: {
                    $or: [
                        {
                            name: {
                                $iLike: `%${srh}%`,
                            },
                        },
                        {
                            email: {
                                $iLike: `%${srh}%`,
                            },
                        },
                    ],
                },
            });
        }
    }


    getPlayerBySub(playerSub) {
        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug('[PlayersController] getPlayerBySub(): playerSub=', playerSub);

        return PlayerModel.find({
            where: {
                sub: playerSub,
            },
        })
            .tap((player) => {
                if (!player) {
                    throw new PlayerNotFoundError(playerSub);
                }
            })
        ;
    }


    registerPlayer(playerRaw, playerExtraRaw) {
        if (!playerRaw ||
            !_.isObject(playerRaw)) {
            return Promise.reject(new WrongParameterError('playerRaw'));
        }

        if (!playerRaw.sub ||
            playerRaw.sub.length <= 0) {
            return Promise.reject(new PlayerProfileIncompleteError(playerRaw, 'sub'));
        }

        if (!playerRaw.name ||
            playerRaw.name.length <= 0) {
            return Promise.reject(new PlayerProfileIncompleteError(playerRaw, 'name_orig'));
        }

        if (!playerRaw.email ||
            playerRaw.email.length <= 0) {
            return Promise.reject(new PlayerProfileIncompleteError(playerRaw, 'email'));
        }

        if (playerExtraRaw) {
            if (!playerExtraRaw.name ||
                playerExtraRaw.name.length <= 0) {
                return Promise.reject(new PlayerProfileIncompleteError(playerRaw, 'name_extra'));
            }
        }

        winston.debug('[PlayersController] registerPlayer()');

        const playerData = {
            sub: playerRaw.sub,
            name_orig: playerRaw.name,
            email: playerRaw.email,
        };

        if (playerRaw.picture &&
            playerRaw.picture.length > 0) {
            playerData.picture_url = playerRaw.picture;
        } else if (playerRaw.picture_url &&
            playerRaw.picture_url.length > 0) {
            playerData.picture_url = playerRaw.picture_url;
        }

        if (playerExtraRaw) {
            playerData.name_extra = playerExtraRaw.name;

            if (playerExtraRaw.picture_url &&
                playerExtraRaw.picture_url.length > 0) {
                playerData.picture_url = playerExtraRaw.picture_url;
            }
        }

        return database.transaction((transaction) =>
            PlayerModel.find({
                where: {
                    sub: playerRaw.sub,
                },
                transaction,
            })
                .then((player) => {
                    if (player) {
                        _.merge(player, playerData);
                        player.name = player.name_extra || player.name_orig;

                        return player.save({transaction});
                    }
                    else {
                        if (!playerExtraRaw) {
                            throw new PlayerProfileIncompleteError('name_extra', playerRaw.sub);
                        }

                        playerData.name = playerData.name_extra || playerData.name_orig;

                        return PlayerModel.create(playerData, {transaction});
                    }
                })
                .then((player) => _.pick(player, ['name', 'picture_url']))
                .catch(Sequelize.ValidationError, (err) => {
                    throw new PlayerValidationError(err.message);
                })
                .catch(Sequelize.UniqueConstraintError, (err) => {
                    throw new PlayerDuplicateError(err.errors[0].message);
                })
        );
    }


    removePlayerBySub(playerSub) {
        if (!playerSub ||
            playerSub.length <= 0) {
            return Promise.reject(new WrongParameterError('playerSub'));
        }

        winston.debug('[PlayersController] removePlayerBySub(): playerSub=', playerSub);

        return database.transaction((transaction) =>
            PlayerModel.find({
                where: {
                    sub: playerSub,
                },
                transaction,
            })
            .tap((player) => {
                if (!player) {
                    throw new PlayerNotFoundError(playerSub);
                }
            })
            .then((player) => player.destroy({transaction}))
        );
    }
}



////////////

module.exports = {
    playersController: new PlayersController(),
    PlayerError,
    PlayerNotFoundError,
    PlayerProfileIncompleteError,
    PlayerValidationError,
    PlayerDuplicateError,
};
