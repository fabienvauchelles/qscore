'use strict';

const
    Umzug = require('umzug'),
    Sequelize = require('sequelize'),
    winston = require('winston');



class Migration {

    constructor(client) {
        const migrationMapping = {
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
        };

        this.client = client;

        this.engine = new Umzug({
            storage: 'sequelize',
            storageOptions: {
                model: client.define(
                    'migrations',
                    migrationMapping,
                    {
                        underscored: true,
                    }
                ),
                columnName: 'name',
            },
            migrations: {
                params: [
                    client,
                    client.constructor, // DataTypes
                ],
                path: `${__dirname}/scripts`,
                pattern: /\d{2,}_[\w-]+/,
            },
        });

        this.engine.on('migrating', this._logEvent('migrating ...'));
        this.engine.on('migrated', this._logEvent('migrated'));
    }


    upgrade() {
        return this._checkSubmissions(this.client)
            .then((check) => {
                if (!check.isFulfilled()) {
                    winston.info('Table SUBMISSIONS does not exist, syncing model and implanting seed');

                    return this.client.sync();
                }
            })
            .then(() => this.migrate())
        ;
    }


    migrate() {
        return this
            .engine
            .up()
            .then(() => {
                winston.info('Database migration upgrade successful');
            })
            .catch((err) => {
                winston.error(err);
            })
        ;
    }


    _logEvent(step) {
        return (name) => {
            winston.info(`${name} ${step}`);
        };
    }


    _checkSubmissions(dbconn) {
        return dbconn.query('SELECT 1 from submissions', {type: Sequelize.QueryTypes.SELECT}).reflect();
    }
}



////////////

module.exports = Migration;

