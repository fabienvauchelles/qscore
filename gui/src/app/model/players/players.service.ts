import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Player, PlayerCreate, PlayersPaginated} from './player.model';



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


    registerMe$(token: string, player: PlayerCreate) {
        const data: any = {token};
        if (player) {
            data.player = player.toJson();
        }

        return this._http.post<void>('api/players/me', data);
    }


    removePlayerById$(sub: string) {
        return this._http.delete<void>(`api/players/${sub}`);
    }
}
