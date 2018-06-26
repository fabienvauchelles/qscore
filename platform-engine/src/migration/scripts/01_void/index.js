'use strict';


class Migration {

    up(database) {
        return database.query('SELECT 1 + 1');
    }
}


////////////

module.exports = new Migration();
