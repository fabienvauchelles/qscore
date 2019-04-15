'use strict';


class Migration {

    up(database) {
        return this
            .addNameOrig(database)
            .then(() => this.addNameExtra(database))
        ;
    }


    addNameOrig(database) {
        return database
            .query('ALTER TABLE players ADD COLUMN IF NOT EXISTS name_orig VARCHAR(255) NOT NULL DEFAULT \'\'')
            .then(() => database.query('UPDATE players SET name_orig = name'))
            .then(() => database.query('ALTER TABLE players ALTER COLUMN name_orig DROP DEFAULT'))
    }


    addNameExtra(database) {
        return database
            .query('ALTER TABLE players ADD COLUMN IF NOT EXISTS name_extra VARCHAR(255)')
    }
}


////////////

module.exports = new Migration();
