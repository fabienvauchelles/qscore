import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {
    Competition,
    CompetitionCreate,
    CompetitionPlayer,
    CompetitionPlayersPaginated,
    CompetitionRank
} from './competiton.model';



@Injectable()
export class CompetitionsService {

    constructor(private _http: HttpClient) {
    }


    getAllCompetitions$(): Observable<Competition[]> {
        return this
            ._http
            .get<Competition[]>('api/competitions')
        ;
    }


    getCompetitionById$(competitionId: string,
                        fields: string[] = []): Observable<Competition> {
        let params = new HttpParams();

        if (fields.length > 0) {
            params = params.set('fields', fields.join(','));
        }

        return this
            ._http
            .get<Competition>(`api/competitions/${competitionId}`, {params})
        ;
    }


    getCompetitionRulesById$(competitionId: string): Observable<Competition> {
        return this
            ._http
            .get<Competition>(`api/competitions/${competitionId}/rules`)
        ;
    }


    getCompetitionLeaderboardInfosById$(competitionId: string): Observable<Competition> {
        return this
            ._http
            .get<Competition>(`api/competitions/${competitionId}/leaderboardinfos`)
        ;
    }


    getCompetitionRankById$(competitionId: string): Observable<CompetitionRank> {
        return this
            ._http
            .get<CompetitionRank>(`api/competitions/${competitionId}/rank`)
        ;
    }


    createCompetition$(competition: CompetitionCreate): Observable<Competition> {
        return this
            ._http
            .post<Competition>('api/competitions', competition)
        ;
    }


    updateCompetitionById$(
        competitionId: string,
        competition: CompetitionCreate
    ): Observable<Competition> {
        return this
            ._http
            .put<Competition>(`api/competitions/${competitionId}`, competition)
        ;
    }


    removeCompetitionById$(competitionId: string): Observable<void> {
        return this
            ._http
            .delete<void>(`api/competitions/${competitionId}`)
        ;
    }


    allowLeaderboard$(competitionId: string, playerSub: string): Observable<void> {
        return this
            ._http
            .post<void>(`api/competitions/${competitionId}/players/${playerSub}`, {})
        ;
    }


    forbidLeaderboard$(competitionId: string, playerSub: string): Observable<void> {
        return this
            ._http
            .delete<void>(`api/competitions/${competitionId}/players/${playerSub}`)
        ;
    }


    registerCompetition$(
        competitionId: string,
        password: string
    ): Observable<void> {
        return this
            ._http
            .post<void>(`api/competitions/${competitionId}/register`, {password})
        ;
    }


    unregisterCompetition$(competitionId: string): Observable<void> {
        return this
            ._http
            .delete<void>(`api/competitions/${competitionId}/register`)
        ;
    }


    getAllPlayers$(competitionId: string, search = '', offset = 0, limit = 8): Observable<CompetitionPlayersPaginated> {
        const params = {
            search,
            offset: offset.toString(),
            limit: limit.toString(),
        };

        return this
            ._http
            .get<CompetitionPlayer[]>(`api/competitions/${competitionId}/players`, {
                params,
                observe: 'response',
            })
            .map((resp) => new CompetitionPlayersPaginated(
                parseInt(resp.headers.get('total-count')),
                resp.body
            ))
        ;
    }
}
