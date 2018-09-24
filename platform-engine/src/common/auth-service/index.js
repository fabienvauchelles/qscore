'use strict';


const
    Promise = require('bluebird'),
    expressJwt = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    jwks = require('jwks-rsa');


const
    config = require('../../config');



class AuthService {
    constructor() {}


    getSecret() {
        throw new Error('UnsupportedError');
    }

    getAlgorithms() {
        throw new Error('UnsupportedError');
    }


    verifyJwt(token) {
        return Promise.reject(new Error('UnsupportedError'));
    }


    getJwtPlayer() {
        if (!this._getJwtPlayerImpl) {
            const getJwtPlayerImpl = expressJwt({
                secret: this.getSecret(),
                audience: config.auth.player.audience,
                issuer: config.auth.player.issuer,
                algorithms: this.getAlgorithms(),
            });

            this._getJwtPlayerImpl = (req, res, next) => {
                // If token exists in query, copy it in the headers
                if (req.query &&
                    req.query.token) {
                    req.headers['authorization'] = `Bearer ${req.query.token}`;
                }

                getJwtPlayerImpl(req, res, (err) => {
                    if (err) {
                        req.jwt_err = err;
                    }

                    if (req.user &&
                        typeof req.user.scope === 'string') {
                        const scopes = req.user.scope.split(' ');
                        req.admin = scopes.indexOf('admin') >= 0;
                    }
                    else {
                        req.admin = false;
                    }

                    return next();
                });
            };
        }

        return this._getJwtPlayerImpl;
    }


    checkJwtPlayer() {
        return (req, res, next) => {
            this.getJwtPlayer()(req, res, () => {
                if (req.jwt_err) {
                    return next(req.jwt_err);
                }

                return next();
            })
        };
    }


    checkJwtAdmin() {
        if (!this._checkJwtAdminImpl) {
            this._checkJwtAdminImpl = expressJwt({
                secret: config.auth.admin.secret,
                audience: config.auth.admin.audience,
                issuer: config.auth.admin.issuer,
                algorithms: ['HS256'],
            });
        }

        return this._checkJwtAdminImpl;
    }


    isAdmin() {
        return (req, res, next) => {
            if (req.admin) {
                return next();
            }

            return res.status(403).send('Insufficient scope');
        };
    }


    extractBearerOrDeny() {
        return (req, res, next) => {
            const token = getTokenFromHeader(req) || getTokenFromQuery(req);

            if (!token) {
                return res.status(401).send('token_error');
            }

            req.token = token;

            return next();


            ////////////

            function getTokenFromHeader(r) {
                const authHeader = r.headers['authorization'];
                if (!authHeader) {
                    return;
                }

                const matchHeader = authHeader.match(/Bearer (.+)/);
                if (matchHeader.length !== 2) {
                    return;
                }

                return matchHeader[1];
            }

            function getTokenFromQuery(r) {
                return r.query['token'];
            }
        };
    }
}


class AuthServiceJwks extends AuthService {
    constructor() {
        super();

        const opts = {
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: config.auth.player.jwksUri,
        };

        this._clientJwt = jwks(opts);
        this._secret = jwks.expressJwtSecret(opts);
    }


    getSecret() {
        return this._secret;
    }

    getAlgorithms() {
        return ['RS256'];
    }


    verifyJwt(token) {
        const self = this;

        return decodeAndCheckJwt(token)
            .then((dtoken) => getSigningKey(dtoken.header.kid))
            .then((key) => verifyToken(token, key))
        ;


        ////////////

        function decodeAndCheckJwt(tk) {
            return new Promise((resolve, reject) => {
                let dtk;
                try {
                    dtk = jwt.decode(tk, {complete: true}) || {};
                }
                catch (err) {
                    return reject(new jwt.JsonWebTokenError('Cannot decode JWT token', err));
                }

                if (!dtk.header ||
                    dtk.header.alg !== 'RS256') {
                    return reject(new jwt.JsonWebTokenError('Algorithm must be RS256'));
                }

                return resolve(dtk);
            });
        }

        function getSigningKey(kid) {
            return new Promise((resolve, reject) => {
                self._clientJwt.getSigningKey(kid, (err, key) => {
                    if (err) {
                        return reject(new jwt.JsonWebTokenError('Public key not found on JWKS', err));
                    }

                    const foundKey = key.publicKey || key.rsaPublicKey;
                    return resolve(foundKey);
                });
            });
        }

        function verifyToken(tk, key) {
            return new Promise((resolve, reject) => {
                jwt.verify(tk, key, (err, payload) => {
                    if (err) {
                        return reject(new jwt.JsonWebTokenError('Cannot verify token', err));
                    }

                    return resolve(payload);
                });
            });
        }
    }
}


class AuthServiceSecret extends AuthService {
    constructor() {
        super();
    }


    getSecret() {
        return config.auth.player.secret;
    }

    getAlgorithms() {
        return ['HS256'];
    }


    verifyJwt(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.getSecret(), (err, payload) => {
                if (err) {
                    return reject(new jwt.JsonWebTokenError('Cannot verify token', err));
                }

                return resolve(payload);
            });
        });
    }
}


////////////

switch (config.auth.player.type) {
    case 'jwks': {
        module.exports = new AuthServiceJwks();
        break;
    }

    case 'secret': {
        module.exports = new AuthServiceSecret();
        break;
    }

    default: {
        throw new Error('Auth type unknown or not specified');
    }
}
