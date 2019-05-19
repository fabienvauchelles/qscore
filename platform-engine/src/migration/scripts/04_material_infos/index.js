'use strict';

const
    Promise = require('bluebird');



class Migration {

    up(database) {
        const sqls = [
            'ALTER TABLE materials ADD COLUMN IF NOT EXISTS release_at TIMESTAMP WITH TIME ZONE',
            'ALTER TABLE materials ADD COLUMN IF NOT EXISTS description TEXT',
        ];

        return Promise.mapSeries(sqls, (sql) => database.query(sql));
    }
}


////////////

module.exports = new Migration();
