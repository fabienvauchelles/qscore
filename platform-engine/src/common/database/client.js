'use strict';

// Postgres count parse fix
require('pg').defaults.parseInt8 = true;

const
    _ = require('lodash'),
    Sequelize = require('sequelize'),
    winston = require('winston');

const
    {retry} = require('../helpers'),
    Migration = require('../../migration');

const
    config = require('../../config');


const logging = config.node_env !== 'production';

const client = new Sequelize(
    config.database.database,
    config.database.user,
    config.database.password,
    {
        dialect: 'postgres',
        port: config.database.port,
        host: config.database.host,
        pool: config.database.pool,
        quoteIdentifiers: false,
        logging,
    }
);



function attemptToConnect() {
    const {host, port} = this.options;

    winston.debug('[Database] attemptToConnect(): url=', `sql://${host}:${port}/${config.database.database}`);

    return this
        .authenticate()
        .then(() => {
            winston.debug('[Database] Connection to database successful');
        })
    ;
}



// Function to wait for database to be up after {retries} retries, every {delay} ms.
function waitForIt(options) {
    winston.debug('[Database] waitForIt()');

    return retry(
        () => this._attemptToConnect(),
        _.merge({}, options, options.database, {fatalError: Sequelize.AccessDeniedError})
    );
}



function migrate() {
    return new Migration(client).upgrade();
}



function clean() {
    winston.debug('[Database] clean()');
    return client
        .drop()
        .then(() => client.sync())
    ;
}



client._attemptToConnect = attemptToConnect;
client.waitForIt = waitForIt;
client.migrate = migrate;
client.clean = clean;


////////////

module.exports = client;
