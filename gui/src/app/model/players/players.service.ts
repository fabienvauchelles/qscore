import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Player, PlayersPaginated} from './player.model';



@Injectable()
export class PlayersService {

    constructor(private _http: HttpClient) {
    }


    getAllPlayers$(search: string, offset = 0, limit = 8): Observable<PlayersPaginated> {
        const params = {
            search,
            offset: offset.toString(),
            limit: limit.toString(),
        };

        return this
            ._http
            .get<Player[]>('api/players', {
                params,
                observe: 'response',
            })
            .map((resp) => new PlayersPaginated(
                parseInt(resp.headers.get('total-count')),
                resp.body
            ))
        ;
    }


    registerMe$(token: string) {
        return this._http.post<void>('api/players/me', {token});
    }


    removePlayerById$(sub: string) {
        return this._http.delete<void>(`api/players/${sub}`);
    }
}
