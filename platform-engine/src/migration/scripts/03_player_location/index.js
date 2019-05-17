'use strict';

const
    Promise = require('bluebird');



class Migration {

    up(database) {
        const sqls = [
            'ALTER TABLE leads ADD COLUMN IF NOT EXISTS player_location VARCHAR(255)',
            'ALTER TABLE player_competitions ADD COLUMN IF NOT EXISTS player_location VARCHAR(255)',
            'ALTER TABLE player_competitions ALTER COLUMN allow_leaderboard DROP DEFAULT',
            'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS register_strategy_type INTEGER NOT NULL DEFAULT 0',
            'ALTER TABLE competitions ALTER COLUMN register_strategy_type DROP DEFAULT',
            'ALTER TABLE competitions ADD COLUMN IF NOT EXISTS register_strategy JSON NOT NULL DEFAULT \'{}\'::json',
            'ALTER TABLE competitions ALTER COLUMN register_strategy DROP DEFAULT',
            'ALTER TABLE competitions DROP COLUMN password',
            'ALTER TABLE competitions DROP COLUMN password_needed',
        ];

        return Promise.mapSeries(sqls, (sql) => database.query(sql));
    }
}


////////////

module.exports = new Migration();
