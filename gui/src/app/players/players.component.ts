import 'rxjs/add/operator/debounceTime';
import {Subscription} from 'rxjs/Subscription';
import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {InformationsService} from '../common/informations/informations.service';
import {Player} from '../model/players/player.model';
import {PlayersService} from '../model/players/players.service';
import {ModalsService} from '../common/modals/modals.service';



@Component({
    templateUrl: './players.component.html',
    styleUrls: ['./players.component.scss']
})
export class PlayersComponent implements OnInit, OnDestroy {

    players: Player[] = [];

    currentPage = 1;
    itemsPerPage = 20;
    maxSize = 15;
    totalItems = 0;

    searchControl = new FormControl();
    searchControlSub: Subscription;

    private _search = '';


    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _playersService: PlayersService,
                private _modalsService: ModalsService,
                private _informationsService: InformationsService) {
    }


    ngOnInit() {
        this.searchControlSub = this.searchControl.valueChanges
            .debounceTime(300)
            .subscribe((newValue) => {
                this._search = newValue;
                this.currentPage = 1;

                this.updatePlayersPage(void 0);
            });

        this.updatePlayersPage(void 0);
    }


    ngOnDestroy() {
        this.searchControlSub.unsubscribe();
    }


    updatePlayersPage($event) {
        if ($event) {
            this.currentPage = $event.page;
        }

        const offset = (this.currentPage - 1) * this.itemsPerPage;

        this
            ._playersService
            .getAllPlayers$(this._search, offset, this.itemsPerPage)
            .subscribe({
                next: (playersPaginated) => {
                    this.totalItems = playersPaginated.totalCount;
                    this.players = playersPaginated.players;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Players',
                        `Cannot get all players: ${err.message}`,
                    );
                }
            })
        ;
    }


    removePlayerWithConfirm(player) {
        this
            ._modalsService.confirm$(
            'Player',
            `Do you want to remove player '${player.name}' and all associated informations ?`
        )
            .subscribe((confirmation) => {
                if (!confirmation) {
                    return;
                }

                this._removePlayer(player);
            })
        ;
    }


    private _removePlayer(player) {
        if (!player) {
            return;
        }

        this
            ._playersService
            .removePlayerById$(player.sub)
            .subscribe({
                next: () => {
                    this.updatePlayersPage(void 0);

                    this._informationsService.success(
                        'Player',
                        `Player ${player.name} removed`,
                    );
                },
                error: (err) => {
                    console.error('Remove Error:', err);

                    this._informationsService.error('Remove Error', err.error);
                }
            })
        ;
    }
}
