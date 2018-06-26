'use strict';

const
    {
        Controller,
        BadRequestError,
        ResourceNotFoundError,
    } = require('../../common/controller'),
    authService = require('../../common/auth-service'),
    {
        playersController,
        PlayerNotFoundError,
        PlayerProfileIncompleteError,
        PlayerValidationError,
        PlayerDuplicateError,
    } = require('../../model/players/players.controller');


class PlayersController extends Controller {

    getAllPlayers(req, res) {
        const
            search = req.query.search,
            offset = parseInt(req.query.offset) || void 0,
            limit = parseInt(req.query.limit) || void 0;

        return playersController
            .getAllPlayers(search, offset, limit)
            .spread((players, totalCount) => {
                res.set('total-count', totalCount);

                this.sendData(res, players);
            })
        ;
    }


    getPlayerBySub(req, res) {
        const playerSub = req.params.playerSub;

        return playersController
            .getPlayerBySub(playerSub)
            .then((player) => {
                this.sendData(res, player);
            })
            .catch(PlayerNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    registerMe(req, res) {
        const token = req.body.token;

        if (!token ||
            token.length <= 0) {
            throw new BadRequestError('Request must contains the token');
        }

        return authService
            .verifyJwt(token)
            .then((player) => playersController.createOrUpdatePlayer(player))
            .then(() => {
                this.sendNoData(res);
            })
            .catch(PlayerProfileIncompleteError, (err) => {
                throw new BadRequestError(err.message);
            })
            .catch(PlayerValidationError, (err) => {
                throw new BadRequestError(err.message);
            })
            .catch(PlayerDuplicateError, (err) => {
                throw new BadRequestError(err.message);
            })
        ;
    }


    removePlayerBySub(req, res) {
        const playerSub = req.params.playerSub;

        return playersController
            .removePlayerBySub(playerSub)
            .then(() => {
                this.sendNoData(res);
            })
            .catch(PlayerNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }
}


////////////

module.exports = new PlayersController();
