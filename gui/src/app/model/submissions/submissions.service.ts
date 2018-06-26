import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Submission, SubmissionsPaginated} from "./submission.model";


@Injectable()
export class SubmissionsService {

    constructor(private _http: HttpClient) {
    }


    getAllSubmissions(competitionId: string, offset = 0, limit = 8): Observable<SubmissionsPaginated> {
        const params = {
            offset: offset.toString(),
            limit: limit.toString(),
        };

        return this
            ._http
            .get<Submission[]>(`api/competitions/${competitionId}/submissions`, {
                params,
                observe: 'response',
            })
            .map((resp) => new SubmissionsPaginated(
                parseInt(resp.headers.get('total-count')),
                resp.body
            ))
        ;
    }


    getBestSubmissionScore(competitionId: string): Observable<number> {
        return this
            ._http
            .get<any>(`api/competitions/${competitionId}/bestsubmission`)
            .map((obj) => obj.score)
        ;
    }


    createSubmission$(
        token: string,
        comment: string,
        datafile: File,
    ): Observable<Submission> {
        const data = new FormData();
        data.append('datafile', datafile);

        if (comment && comment.length >= 0) {
            data.append('comment', comment);
        }

        const headers = new HttpHeaders()
            .append('Authorization', `Bearer ${token}`);

        return this
            ._http
            .post<Submission>('api/submissions', data, {headers})
        ;
    }
}
