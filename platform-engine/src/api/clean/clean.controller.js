'use strict';

const
    {Controller} = require('../../common/controller'),
    database = require('../../common/database');



class CleanController extends Controller {

    clean(req, res) {
        return database
            .clean()
            .then(() => this.sendNoData(res))
        ;
    }
}



////////////

module.exports = new CleanController();
