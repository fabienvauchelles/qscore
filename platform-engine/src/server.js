'use strict';

const
    _ = require('lodash'),
    bodyParser = require('body-parser'),
    express = require('express'),
    http = require('http'),
    expressJwt = require('express-jwt'),
    helmet = require('helmet'),
    morgan = require('morgan'),
    Promise = require('bluebird'),
    url = require('url'),
    redis = require('redis'),
    socketIO = require('socket.io'),
    redisAdapter = require('socket.io-redis'),
    winston = require('winston');

const
    database = require('./common/database'),
    events = require('./common/events'),
    {HttpError} = require('./common/controller'),
    messaging = require('./common/messaging'),
    NetWait = require('./common/net-wait'),
    {WrongParameterError} = require('./common/exceptions'),
    {submissionsController} = require('./model/submissions/submissions.controller');

const
    config = require('./config');



class Server {

    constructor() {
        const app = express();

        app.use(morgan('combined'));
        app.use(helmet());
        app.use(bodyParser.json({limit: '5mb'}));

        // Gateway: Service status
        app.get('/', (req, res) =>
            res.status(204).send()
        );

        // API
        const router = express.Router();
        router.use('/clean', require('./api/clean'));
        router.use('/competitions', require('./api/competitions'));
        router.use('/submissions', require('./api/submissions'));
        router.use('/leads', require('./api/leads'));
        router.use('/players', require('./api/players'));

        app.use('/api', router, errorHandlingMiddleware);

        // HTTP server
        this._server = http.createServer(app);
        this._server.listen = Promise.promisify(this._server.listen);
        this._server.close = Promise.promisify(this._server.close);
        this._keepTrying = true;

        // SocketIO server
        this._serverIO = socketIO(this._server, {
            serveClient: false,
        });


        ////////////

        function errorHandlingMiddleware(err, req, res, next) {
            if (!err) {
                return next();
            }

            if (err instanceof expressJwt.UnauthorizedError) {
                winston.error(err.message);

                return res.status(401).send(err.message);
            }

            if (err instanceof WrongParameterError) {
                winston.error(err.message);

                return res.status(400).send(err.message);
            }

            if (err instanceof HttpError) {
                winston.error(err.serverMessage);

                return err.sendError(res);
            }

            winston.error(err);

            return res.status(500).send(err.message);
        }
    }


    get keepTrying() {
        return this._keepTrying;
    }


    start(options = {}) {
        winston.info('[Server] Starting...');

        // Database
        const databasePromise = database
            .waitForIt(
                _.merge(
                    {keepTrying: () => this.keepTrying},
                    options
                )
            )

            // Upgrade database schemas
            .then(() => database.migrate())
            .then(() => database.sync())
        ;

        // Messaging client
        const messagingPromise = messaging.openAndWaitForIt();

        // Wait for redis
        const waitRedisPromise = new NetWait(config.redis.host, config.redis.port)
            .waitForIt(
                _.merge(
                    {keepTrying: () => this.keepTrying},
                    options
                )
            )
            .then(() => {
                let clientsOpts = void 0;
                if (config.redis.password) {
                    clientsOpts = { auth_pass: config.redis.password };
                }
                const pub = redis.createClient(config.redis.port, config.redis.host, clientsOpts);
                const sub = redis.createClient(config.redis.port, config.redis.host, clientsOpts);
                this._serverIO.adapter(redisAdapter({ pubClient: pub, subClient: sub }));
                events.start(this._serverIO);
            })
        ;

        return Promise
            .join(databasePromise, messagingPromise, waitRedisPromise)

            // Launch API
            .then(() => this._server.listen(config.server.port))
            .then(() => winston.info(`API listening on ${url.resolve(config.server.url, 'api')}`))

            // Check remaining submissions
            .then(() => {
                // Never return !
                submissionsController.start();
            })
        ;
    }


    stop() {
        winston.info('[Server] Stopping...');

        this._keepTrying = false;

        submissionsController.stop();

        return Promise
            .join(
                messaging.close()
            )
            .then(() => this._server.close())
            .finally(() => database.close())
            .catch((err) => winston.error(err))
        ;
    }
}



////////////

module.exports = new Server();
