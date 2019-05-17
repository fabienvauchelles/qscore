'use strict';

const
    crypto = require('crypto'),
    Sequelize = require('sequelize');

const
    client = require('../../../common/database/client');



const playerCompetitionMapping = {
    id: {
        type: Sequelize.STRING,
        defaultValue: () => generateToken(),
        primaryKey: true,
    },

    player_location: {
        type: Sequelize.STRING,
    },

    allow_leaderboard: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
};


const PlayerCompetitionModel = client.define(
    'player_competition',
    playerCompetitionMapping,
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


function generateToken() {
    const buffer = crypto.randomBytes(64);
    return buffer.toString('hex');
}


PlayerCompetitionModel.associate = () => {
    const
        PlayerModel = require('../../players/player/player.model'),
        CompetitionModel = require('../../competitions/competition/competition.model');

    PlayerCompetitionModel.belongsTo(PlayerModel, {
        foreignKey: 'player_sub',
        onDelete: 'CASCADE',
    });

    PlayerCompetitionModel.belongsTo(CompetitionModel, {
        foreignKey: 'competition_id',
        onDelete: 'CASCADE',
    });
};


////////////

module.exports = PlayerCompetitionModel;
