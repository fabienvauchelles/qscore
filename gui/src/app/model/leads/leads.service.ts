import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Lead, LeadsPaginated} from './lead.model';



@Injectable()
export class LeadsService {
    constructor(private _http: HttpClient) {
    }


    getAllLeads$(competitionId: string, offset = 0, limit = 8): Observable<LeadsPaginated> {
        const params = {
            offset: offset.toString(),
            limit: limit.toString(),
        };

        return this
            ._http
            .get<Lead[]>(`api/leads/${competitionId}`, {
                params,
                observe: 'response',
            })
            .map((resp) => new LeadsPaginated(
                parseInt(resp.headers.get('total-count')),
                resp.body
            ))
        ;
    }
}
