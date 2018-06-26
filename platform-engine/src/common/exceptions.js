'use strict';



class WrongParameterError extends Error {
    constructor(name) {
        super(`Parameter ${name} is missing or invalid`);

        this.name = name;
    }
}



////////////

module.exports = {
    WrongParameterError,
};
