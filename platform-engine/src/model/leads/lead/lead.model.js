'use strict';

const
    Sequelize = require('sequelize');

const
    client = require('../../../common/database/client');



const leadMapping = {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },

    score: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },

    score_updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
    },

    submissions_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
};


const LeadModel = client.define(
    'lead',
    leadMapping,
    {
        underscored: true,

        indexes: [
            {
                unique: true,
                fields: ['player_sub', 'competition_id'],
            },
        ],
    }
);


LeadModel.associate = () => {
    const
        CompetitionModel = require('../../competitions/competition/competition.model'),
        PlayerModel = require('../../players/player/player.model');

    LeadModel.belongsTo(CompetitionModel, {
        foreignKey: 'competition_id',
        onDelete: 'CASCADE',
    });

    LeadModel.belongsTo(PlayerModel, {
        foreignKey: 'player_sub',
        onDelete: 'CASCADE',
    });
};


////////////

module.exports = LeadModel;
