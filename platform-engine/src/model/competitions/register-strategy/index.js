'use strict';

const
    moment = require('moment');



function loadRegisterStrategy(competition) {
    switch (competition.register_strategy_type) {
        case 0: {
            return new BasicRegisterStrategy(competition);
        }

        case 1: {
            return new PasswordRegisterStrategy(competition);
        }

        case 2: {
            return new LocationPasswordRegisterStrategy(competition);
        }

        default: {
            throw new Error('Register strategy unknown');
        }
    }
}



class RegisterStrategyError extends Error {
    constructor(message, competitionId) {
        super(message);

        this.competitionId = competitionId;
    }
}



class RegisterStrategyWrongPasswordError extends RegisterStrategyError {
    constructor(competitionId) {
        super(`Competition ${competitionId} wrong password`, competitionId);
    }
}



class RegisterStrategyNotOpenedError extends RegisterStrategyError {
    constructor(competitionId) {
        super(`Competition ${competitionId} is not opened`, competitionId);
    }
}



class BasicRegisterStrategy {
    constructor(competition) {
        this._competition = competition;
    }


    get competition() {
        return this._competition;
    }


    register(auth, viewAll) {
        if (!viewAll) {
            // Is opened ?
            const now = moment();
            if (now.isBefore(this.competition.date_start) ||
                now.isSameOrAfter(this.competition.date_end)) {
                throw new RegisterStrategyNotOpenedError(this.competition.id);
            }
        }

        return {
            allow_leaderboard: true,
        };
    }
}



class PasswordRegisterStrategy extends BasicRegisterStrategy {
    constructor(competition) {
        super(competition);
    }


    register(auth, viewAll) {
        const strategyOpts = super.register(auth, viewAll);

        if (!viewAll) {
            if (auth.password !== this.competition.register_strategy.password) {
                throw new RegisterStrategyWrongPasswordError(this.competition.id);
            }
        }

        return strategyOpts;
    }
}



class LocationPasswordRegisterStrategy extends BasicRegisterStrategy {
    constructor(competition) {
        super(competition);
    }


    register(auth, viewAll) {
        const strategyOpts = super.register(auth, viewAll);

        strategyOpts.player_location = this.competition.register_strategy.locations[auth.password];

        if (!viewAll) {
            if (!strategyOpts.player_location) {
                throw new RegisterStrategyWrongPasswordError(this.competition.id);
            }
        }

        return strategyOpts;
    }
}



////////////

module.exports = {
    loadRegisterStrategy,
    RegisterStrategyError,
    RegisterStrategyWrongPasswordError,
    RegisterStrategyNotOpenedError,
};



