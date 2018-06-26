'use strict';

const
    winston = require('winston');

const
    authService = require('../auth-service'),
    {AccessDeniedError} = require('../controller'),
    {WrongParameterError} = require('../exceptions');


class Events {

    constructor() {
    }


    start(serverIO) {
        this._serverIO = serverIO;

        winston.debug('[Events] start()');

        this._serverIO.on('connection', (socket) => {
            socket.on('register', ({competitionId, namespace, access_token}) => {
                try {
                    this._registerEvent(competitionId, namespace, access_token, socket);
                }
                catch (err) {
                    winston.error('Error:', err);
                }
            });

            socket.on('unregister', ({competitionId, namespace, access_token}) => {
                try {
                    this._unregisterEvent(competitionId, namespace, access_token, socket);
                }
                catch (err) {
                    winston.error('Error:', err);
                }
            });
        });
    }


    emit(competitionId, namespace, event, data) {
        if (!competitionId ||
            competitionId.length <= 0) {
            throw new WrongParameterError('competitionId');
        }

        if (!namespace ||
            namespace.length <= 0) {
            throw new WrongParameterError('namespace');
        }

        if (!event ||
            event.length <= 0) {
            throw new WrongParameterError('event');
        }

        winston.debug(
            '[Events] emit(): competitionId=', competitionId,
            '/ namespace=', namespace,
            '/ event=', event
        );

        const namespaceWithCompetition = `competition::${competitionId}::${namespace}`;

        this._serverIO.to(namespaceWithCompetition).emit(event, data);
    }


    _registerEvent(competitionId, namespace, accessToken, socket) {
        if (!competitionId ||
            competitionId.length <= 0) {
            throw new WrongParameterError('competitionId');
        }

        if (!namespace ||
            namespace.length <= 0) {
            throw new WrongParameterError('namespace');
        }

        winston.debug('[Events] _registerEvent(): competitionId=', competitionId, '/ namespace=', namespace);

        let authPromise;
        if (this._isAuthNeeded(namespace)) {
            authPromise = canAccessToCompetition(competitionId, accessToken);
        }
        else {
            authPromise = Promise.resolve();
        }

        authPromise
            .then(() => {
                socket.join(`competition::${competitionId}::${namespace}`);
            })
            .catch((err) => {
                winston.error(
                    '[Events] _registerEvent: cannot register the competitionId=', competitionId, '. Error=', err
                );
            })
        ;


        ////////////

        function canAccessToCompetition(cId, token) {
            return authService
                .verifyJwt(token)
                .then((player) => {
                    // Loop otherwise
                    const {competitionsController} = require('../../model/competitions/competitions.controller');
                    return competitionsController.isRegisteredToCompetition(cId, player.sub);
                })
                .then((permission) => {
                    if (!permission) {
                        throw new AccessDeniedError();
                    }
                })
            ;
        }
    }


    _unregisterEvent(competitionId, namespace, accessToken, socket) {
        if (!competitionId ||
            competitionId.length <= 0) {
            winston.warn('[Events] _unregisterEvent(): Undefined competitionId');
            return;
        }

        if (!namespace ||
            namespace.length <= 0) {
            winston.warn('[Events] _unregisterEvent(): Undefined namespace');
            return;
        }

        winston.debug('[Events] _unregisterEvent(): competitionId=', competitionId, '/ namespace=', namespace);

        let authPromise;
        if (this._isAuthNeeded(namespace)) {
            authPromise = authService.verifyJwt(accessToken);
        }
        else {
            authPromise = Promise.resolve();
        }

        authPromise
            .then(() => {
                socket.leave(`competition::${competitionId}::${namespace}`);
            })
            .catch((err) => {
                winston.error(
                    '[Events] _unregisterEvent: cannot unregister the competitionId=', competitionId, '. Error=', err
                );
            })
        ;
    }


    _isAuthNeeded(namespace) {
        return namespace !== 'leaderboard';
    }
}



////////////

module.exports = new Events();
