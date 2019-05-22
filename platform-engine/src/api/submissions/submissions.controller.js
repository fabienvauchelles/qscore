'use strict';

const
    {
        Controller,
        BadRequestError,
        ResourceNotFoundError,
        TooManyRequestsError,
        AuthenticationError,
        AccessDeniedError,
        FileError,
    } = require('../../common/controller'),
    {
        CompetitionTokenNotFoundError,
        CompetitionNotFoundError,
    } = require('../../model/competitions/competitions.controller'),
    {
        submissionsController,
        SubmissionError,
        SubmissionNotFoundError,
        SubmissionTokenTooCloseError,
        SubmissionTokenNotOpenedError,
    } = require('../../model/submissions/submissions.controller');



class SubmissionsController extends Controller {

    getAllSubmissions(req, res) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.user.sub,
            offset = parseInt(req.query.offset) || void 0,
            limit = parseInt(req.query.limit) || void 0;

        return submissionsController
            .getAllSubmissions(competitionId, playerSub, offset, limit)
            .spread((submissions, totalCount) => {
                res.set('total-count', totalCount);

                this.sendData(res, submissions);
            })
        ;
    }


    getBestSubmissionScore(req, res) {
        const
            competitionId = req.params.competitionId,
            playerSub = req.user.sub;

        return submissionsController
            .getBestSubmissionScore(competitionId, playerSub)
            .then((score) => {
                this.sendData(res, {score});
            })
            .catch(CompetitionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
            .catch(SubmissionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    getSubmissionDataById(req, res) {
        const submissionId = req.params.submissionId;

        return submissionsController
            .getSubmissionDataById(submissionId)
            .then((submission) => {
                res.setHeader('Content-Type', 'application/octet-stream');

                res.send(submission.fileBuffer);
            })
            .catch(SubmissionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
            .catch(SubmissionError, (err) => {
                throw new BadRequestError(err.message);
            })
        ;
    }


    createSubmission(req, res) {
        const token = req.token;

        return submissionsController.createSubmissionCheck(token)
            .then((pc) => this.readFile(req)
                    .spread((fileBuffer, fields) => submissionsController.createSubmission(token, pc, fields.comment, fileBuffer))
            )
            .then((submission) => {
                this.sendData(res, submission);
            })
            .catch(FileError, (err) => {
                throw new BadRequestError(err.message);
            })
            .catch(CompetitionTokenNotFoundError, (err) => {
                throw new AuthenticationError(err.message);
            })
            .catch(SubmissionTokenTooCloseError, (err) => {
                throw new TooManyRequestsError(err.message, err.remainingTime);
            })
            .catch(SubmissionTokenNotOpenedError, (err) => {
                throw new AccessDeniedError(err.message);
            })
        ;
    }


    updateSubmissionScore(req, res) {
        const
            submissionId = req.params.submissionId,
            score = req.body.score;

        return submissionsController
            .updateSubmissionValid(submissionId, score)
            .then((submission) => {
                this.sendData(res, submission);
            })
            .catch(SubmissionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }


    updateSubmissionError(req, res) {
        const
            submissionId = req.params.submissionId,
            message = req.body.message;

        return submissionsController
            .updateSubmissionInvalid(submissionId, message)
            .then((submission) => {
                this.sendData(res, submission);
            })
            .catch(SubmissionNotFoundError, (err) => {
                throw new ResourceNotFoundError(err.message);
            })
        ;
    }
}


////////////

module.exports = new SubmissionsController();
