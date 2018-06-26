'use strict';

const
    Sequelize = require('sequelize');

const
    {trimFailsafe} = require('../../../common/helpers'),
    client = require('../../../common/database/client');



const competitionMapping = {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },

    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    title_short: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    scorer_class: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    players_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },

    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    password_needed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },

    published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },

    hidden: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },

    submission_delay: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },

    score_order: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },

    picture_url: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isUrl: true,
        },
    },

    date_start: {
        type: Sequelize.DATE,
        allowNull: false,
    },

    date_end: {
        type: Sequelize.DATE,
        allowNull: false,
    },

    description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    description_short: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    eval_metric: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    eval_format: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    rules: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    materials_description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    leaderboard_html: {
        type: Sequelize.TEXT,
    },

    leaderboard_css: {
        type: Sequelize.TEXT,
    },

    leaderboard_js: {
        type: Sequelize.TEXT,
    },
};


const CompetitionModel = client.define(
    'competition',
    competitionMapping,
    {
        underscored: true,

        indexes: [],

        hooks: {
            beforeValidate: (competition) => {
                [
                    'title', 'title_short', 'scorer_class',
                    'picture_url', 'description', 'description_short',
                    'eval_metric', 'eval_format', 'rules',
                    'materials_description',
                ].forEach((f) => {
                    competition[f] = trimFailsafe(competition[f]);
                });
            },
        },
    }
);


CompetitionModel.associate = () => {
    const PlayerCompetitionModel = require('../../players/competition/player-competition.model');

    CompetitionModel.hasMany(PlayerCompetitionModel);
};


////////////

module.exports = CompetitionModel;
