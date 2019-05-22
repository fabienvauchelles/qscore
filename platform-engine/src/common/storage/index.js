'use strict';

const
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs-extra')),
    path = require('path'),
    winston = require('winston');

const
    config = require('../../config');



class Storage {
    constructor(prefix) {
        this._storagePath = path.join(config.storage, prefix);

        fs.ensureDir(this._storagePath, (err) => {
            winston.error('Storage error', err);
        });
    }


    download(filename) {
        const filepath = path.join(this._storagePath, filename);

        return fs.createReadStream(filepath);
    }

    store(fileBuffer, filename) {
        const filepath = path.join(this._storagePath, filename);

        return fs.writeFileAsync(filepath, fileBuffer);
    }


    remove(filename) {
        const filepath = path.join(this._storagePath, filename);

        return fs.unlinkAsync(filepath);
    }
}


////////////

module.exports = Storage;
