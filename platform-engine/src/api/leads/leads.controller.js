'use strict';

const
    {Controller, ResourceNotFoundError} = require('../../common/controller'),
    {leadsController, LeadNotFoundError} = require('../../model/leads/leads.controller');


class LeadsController extends Controller {

    getAllLeads(req, res) {
        const
            competitionId = req.params.competitionId,
            offset = parseInt(req.query.offset) || void 0,
            limit = parseInt(req.query.limit) || void 0;

        return leadsController
            .getAllLeads(competitionId, offset, limit)
            .spread((leads, totalCount) => {
                res.set('total-count', totalCount);

                this.sendData(res, leads);
            })
            .catch(LeadNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    getPlayerRank(req, res) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.user.sub;

        return leadsController
            .getPlayerRank(competitionId, playerSub)
            .then((rank) => {
                this.sendData(res, rank);
            })
            .catch(LeadNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }
}


////////////

module.exports = new LeadsController();
