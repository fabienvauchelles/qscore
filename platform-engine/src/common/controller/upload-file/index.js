'use strict';


class UploadFile {
    constructor(buffer) {
        this._buffer = buffer;
    }


    get buffer() {
        return this._buffer;
    }


    get length() {
        return this._buffer.length;
    }
}



////////////

module.exports = UploadFile;
