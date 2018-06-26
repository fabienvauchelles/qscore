'use strict';

const
    {
        Controller,
        BadRequestError,
        ResourceNotFoundError,
        FileError,
    } = require('../../common/controller'),
    {CompetitionNotFoundError} = require('../../model/competitions/competitions.controller'),
    {
        materialsController,
        MaterialNotFoundError,
        MaterialValidationError,
    } = require('../../model/materials/materials.controller');



class MaterialsController extends Controller {

    getAllMaterials(req, res) {
        const competitionId = req.params.competitionId;

        return materialsController
            .getAllMaterials(competitionId)
            .then((materials) => {
                this.sendData(res, materials);
            })
        ;
    }


    getMaterialById(req, res) {
        const
            competitionId = req.params.competitionId,
            materialId = req.params.materialId;

        return materialsController
            .getMaterialById(competitionId, materialId)
            .then((material) => {
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Disposition', `attachment; filename=${material.filename}`);

                res.send(material.datafile);
            })
            .catch(MaterialNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    createMaterial(req, res) {
        const competitionId = req.params.competitionId;

        return this.readFile(req)
            .spread((file, fields) => materialsController.createMaterial(competitionId, fields.filename, file))
            .then((material) => {
                this.sendData(res, material);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
            .catch(MaterialValidationError, (err) => {
                throw new BadRequestError(err.message);
            })
            .catch(FileError, (err) => {
                throw new BadRequestError(err.message);
            })
        ;
    }


    removeMaterialById(req, res) {
        const
            competitionId = req.params.competitionId,
            materialId = req.params.materialId;

        return materialsController
            .removeMaterialById(competitionId, materialId)
            .then(() => {
                this.sendNoData(res);
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
            .catch(MaterialNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }
}


////////////

module.exports = new MaterialsController();
