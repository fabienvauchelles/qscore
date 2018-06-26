'use strict';

const
    Sequelize = require('sequelize');

const
    {trimFailsafe} = require('../../../common/helpers'),
    client = require('../../../common/database/client');



const playerMapping = {
    sub: {
        type: Sequelize.STRING,
        primaryKey: true,
        validate: {
            notEmpty: true,
        },
    },

    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    picture_url: {
        type: Sequelize.STRING,
        validate: {
            notEmpty: true,
            isUrl: true,
        },
    },
};


const PlayerModel = client.define(
    'player',
    playerMapping,
    {
        underscored: true,

        indexes: [
            {
                unique: true,
                fields: ['email'],
            },
        ],

        hooks: {
            beforeValidate: (user) => {
                [
                    'name', 'email', 'picture_url',
                ].forEach((f) => {
                    user[f] = trimFailsafe(user[f]);
                });
            },
        },
    }
);


PlayerModel.associate = () => {
    const PlayerCompetitionModel = require('../../players/competition/player-competition.model');

    PlayerModel.hasMany(PlayerCompetitionModel);
};


////////////

module.exports = PlayerModel;
