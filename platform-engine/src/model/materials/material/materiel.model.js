'use strict';

const
    Sequelize = require('sequelize');

const
    {trimFailsafe} = require('../../../common/helpers'),
    client = require('../../../common/database/client');



const materialMapping = {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },

    filename: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    datafile: {
        type: Sequelize.BLOB,
        allowNull: false,
    },
};


const MaterielModel = client.define(
    'material',
    materialMapping,
    {
        underscored: true,

        indexes: [],

        hooks: {
            beforeValidate: (user) => {
                [
                    'filename',
                ].forEach((f) => {
                    user[f] = trimFailsafe(user[f]);
                });
            },
        },
    }
);


MaterielModel.associate = () => {
    const
        CompetitionModel = require('../../competitions/competition/competition.model');

    MaterielModel.belongsTo(CompetitionModel, {
        foreignKey: 'competition_id',
        onDelete: 'CASCADE',
    });
};


////////////

module.exports = MaterielModel;
