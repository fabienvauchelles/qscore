'use strict';

const
    _ = require('lodash'),
    Promise = require('bluebird'),
    Sequelize = require('sequelize'),
    winston = require('winston');

const
    MaterialModel = require('./material/materiel.model'),
    {WrongParameterError} = require('../../common/exceptions');



class MaterialError extends Error {
    constructor(message, materialId) {
        super(message);

        this.materialId = materialId;
    }
}



class MaterialNotFoundError extends MaterialError {
    constructor(materialId) {
        super(`Material ${materialId} not found`, materialId);
    }
}



class MaterialValidationError extends Error {
    constructor(message) {
        super(`Material validation error: ${message}`);
    }
}



class MaterialsController {

    constructor() {}


    getAllMaterials(competitionId) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        winston.debug(
            '[MaterialsController] getAllMaterials(): competitionId=', competitionId
        );


        return MaterialModel.findAll({
            where: {
                competition_id: competitionId,
            },
            order: [
                ['filename'],
            ],
            attributes: ['id', 'filename'],
        });
    }


    getMaterialById(competitionId, materialId) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!materialId ||
            materialId.length <= 0) {
            return Promise.reject(new WrongParameterError('materialId'));
        }

        winston.debug(
            '[MaterialsController] getMaterialById(): competitionId=', competitionId,
            ' / materialId=', materialId
        );

        return MaterialModel
            .find({
                where: {
                    competition_id: competitionId,
                    id: materialId,
                },
            })
            .tap((material) => {
                if (!material) {
                    throw new MaterialNotFoundError(materialId);
                }
            })
        ;
    }


    createMaterial(competitionId, filename, file) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!filename ||
            filename.length <= 0) {
            return Promise.reject(new WrongParameterError('filename'));
        }

        if (!file ||
            !_.isObject(file)) {
            return Promise.reject(new WrongParameterError('file'));
        }

        winston.debug(
            '[MaterialsController] createMaterial(): competitionId=', competitionId,
            ' / file.length=', file.length
        );

        return MaterialModel
            .create({
                filename,
                competition_id: competitionId,
                datafile: file.buffer,
            })
            .catch(Sequelize.ValidationError, (err) => {
                throw new MaterialValidationError(err.message);
            })
        ;
    }


    removeMaterialById(competitionId, materialId) {
        if (!competitionId ||
            competitionId.length <= 0) {
            return Promise.reject(new WrongParameterError('competitionId'));
        }

        if (!materialId ||
            materialId.length <= 0) {
            return Promise.reject(new WrongParameterError('materialId'));
        }

        winston.debug(
            '[MaterialsController] removeMaterial(): competitionId=', competitionId,
            ' / materialId=', materialId
        );

        return MaterialModel
            .find({
                where: {
                    competition_id: competitionId,
                    id: materialId,
                },
                attributes: ['id'],
            })
            .tap((material) => {
                if (!material) {
                    throw new MaterialNotFoundError(materialId);
                }
            })
            .then((material) => material.destroy())
        ;
    }
}



////////////

module.exports = {
    materialsController: new MaterialsController(),
    MaterialError,
    MaterialValidationError,
    MaterialNotFoundError,
};
