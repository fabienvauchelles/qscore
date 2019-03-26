'use strict';

const
    winston = require('winston');



const ENV = process.env;

if (['development', 'test'].includes(ENV.NODE_ENV)) {
    winston.level = 'debug';
}

const config = {
    node_env: ENV.NODE_ENV || 'development',

    server: {
        host: ENV.SERVER_HOST || 'localhost',
        port: parseInt(ENV.SERVER_PORT || '3001') + parseInt(ENV.NODE_APP_INSTANCE || '0'),
        protocol: ENV.SERVER_PROTOCOL || 'http',

        get url() {
            return `${this.protocol}://${this.host}:${this.port}`;
        },

        get exposedUrl() {
            return ENV.EXPOSED_URL || this.url;
        },
    },


    redis: {
        host: ENV.REDIS_HOST || 'localhost',
        port: parseInt(ENV.REDIS_PORT || '6379'),
        password: ENV.REDIS_PASS,
    },


    database: {
        host: ENV.POSTGRES_HOST || 'localhost',
        port: parseInt(ENV.POSTGRES_PORT || '5432'),
        user: ENV.POSTGRES_USER,
        password: ENV.POSTGRES_PASSWORD,
        database: ENV.POSTGRES_DB,
        pool: {
            max: 2,
            min: 1,
            idle: 10000,
        },

        get url() {
            const url = ['postgresql://'];
            if (this.user) {
                url.push(this.user);
                if (this.password && this.password.length) {
                    url.push(`:${this.password}`);
                }
                url.push('@');
            }

            url.push(this.host);
            if (this.port) {
                url.push(`:${this.port}`);
            }

            if (this.database) {
                url.push(`/${this.database}`);
            }

            return url.join('');
        },
    },

    auth: {
        player: {
            type: ENV.AUTH_PLAYER_TYPE || 'jwks',
            jwksUri: ENV.AUTH_PLAYER_JWKS_URI,
            secret: ENV.AUTH_PLAYER_SECRET,
            audience: ENV.NG_QS_AUTH_PLAYER_AUDIENCE,
            issuer: ENV.AUTH_PLAYER_ISSUER,
        },

        admin: {
            secret: ENV.AUTH_ADMIN_SECRET,
            audience: ENV.AUTH_ADMIN_AUDIENCE || 'https://qscore',
            issuer: ENV.AUTH_ADMIN_ISSUER || 'https://qscore',
        },
    },


    messaging: {
        host: ENV.RABBITMQ_DEFAULT_HOST || 'localhost',
        port: parseInt(ENV.RABBITMQ_DEFAULT_PORT || '5672'),
        vhost: ENV.RABBITMQ_DEFAULT_VHOST,
        user: ENV.RABBITMQ_DEFAULT_USER,
        password: ENV.RABBITMQ_DEFAULT_PASS,

        get url() {
            return ENV.RABBITMQ_DEFAULT_URL ||
                `amqp://${this.user}:${this.password}@${this.host}:${this.port}/${this.vhost}`;
        },

        exchangeName: ENV.RABBITMQ_DEFAULT_EXCHANGE,
    },


    leaderboard: {
        max: parseInt(ENV.LEADERBOARD_MAX || '10'),
    },


    submissions: {
        maxSize: parseInt(ENV.SUBMISSIONS_MAX_SIZE || '20971520'), // 20Mo
        checkDelay: parseInt(ENV.SUBMISSIONS_CHECK_DELAY || '2000'),
        maxRetries: parseInt(ENV.SUBMISSIONS_MAX_RETRIES || '2'),
        retryDelay: parseInt(ENV.SUBMISSIONS_RETRY_DELAY || '15000'),
    },
};

const test = {
    database: {
        get url() {
            return ENV.MOCK_SQL_URL || config.database.url;
        },

        get exposedUrl() {
            return ENV.MOCK_SQL_EXPOSED_URL || this.url;
        },
    },

    timeout: parseInt(ENV.TEST_TIMEOUT || '600000'),

    submissions: {
        wait: parseInt(ENV.TEST_SUBMISSIONS_WAIT || '5000'),
    },
};


config.test = test;



////////////

module.exports = config;
