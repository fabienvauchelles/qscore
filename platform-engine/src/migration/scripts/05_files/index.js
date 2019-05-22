'use strict';

const
    Promise = require('bluebird');



class Migration {

    up(database) {
        const sqls = [
            'ALTER TABLE materials DROP COLUMN datafile',
            'ALTER TABLE submissions DROP COLUMN datafile',
        ];

        return Promise.mapSeries(sqls, (sql) => database.query(sql));
    }
}


////////////

module.exports = new Migration();
