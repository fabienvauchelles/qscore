'use strict';

const ENV = process.env;


module.exports = {
    auth: {
        player: {
            secret: ENV.AUTH_PLAYER_SECRET,
            audience: ENV.NG_QS_AUTH_PLAYER_AUDIENCE,
            issuer: ENV.AUTH_PLAYER_ISSUER,
        },
    },
};
