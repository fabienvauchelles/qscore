'use strict';

const
    Sequelize = require('sequelize');

const
    {trimFailsafe} = require('../../../common/helpers'),
    client = require('../../../common/database/client');



const statusEnum = ['SUBMITTED', 'VALID', 'INVALID'];


const submissionMapping = {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },

    score: {
        type: Sequelize.DOUBLE,
    },

    error: {
        type: Sequelize.STRING,
    },

    status: {
        type: Sequelize.ENUM(...statusEnum),
        defaultValue: 'SUBMITTED',
        allowNull: false,
    },

    comment: {
        type: Sequelize.TEXT,
    },

    retry: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
};


const SubmissionModel = client.define(
    'submission',
    submissionMapping,
    {
        underscored: true,

        indexes: [],

        hooks: {
            beforeValidate: (user) => {
                [
                    'error', 'comment',
                ].forEach((f) => {
                    user[f] = trimFailsafe(user[f]);
                });
            },
        },
    }
);


SubmissionModel.associate = () => {
    const
        CompetitionModel = require('../../competitions/competition/competition.model'),
        PlayerModel = require('../../players/player/player.model');

    SubmissionModel.belongsTo(CompetitionModel, {
        foreignKey: 'competition_id',
        onDelete: 'CASCADE',
    });

    SubmissionModel.belongsTo(PlayerModel, {
        foreignKey: 'player_sub',
        onDelete: 'CASCADE',
    });
};


////////////

module.exports = SubmissionModel;
