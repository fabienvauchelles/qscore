import 'rxjs/add/operator/debounceTime';
import {Subscription} from 'rxjs/Subscription';
import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CompetitionsService} from '../../../model/competitions/competitions.service';
import {InformationsService} from '../../../common/informations/informations.service';
import {CompetitionPlayer} from '../../../model/competitions/competiton.model';
import {ModalsService} from '../../../common/modals/modals.service';



@Component({
    templateUrl: './competition-players.component.html',
    styleUrls: ['./competition-players.component.scss']
})
export class CompetitionPlayersComponent implements OnInit, OnDestroy {

    players: CompetitionPlayer[] = [];

    currentPage = 1;
    itemsPerPage = 20;
    maxSize = 15;
    totalItems = 0;

    private _competitionId: string;

    searchControl = new FormControl();
    searchControlSub: Subscription;

    private _search = '';


    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _competitionsService: CompetitionsService,
                private _modalsService: ModalsService,
                private _informationsService: InformationsService) {
    }


    ngOnInit() {
        this._competitionId = this._route.snapshot.parent.params['competitionId'];

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
            ._competitionsService
            .getAllPlayers$(this._competitionId, this._search, offset, this.itemsPerPage)
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


    allowLeaderboard(player) {
        this._competitionsService
            .allowLeaderboard$(this._competitionId, player.sub)
            .subscribe({
                next: () => {
                    player.allow_leaderboard = true;

                    this._informationsService.success(
                        'Player',
                        `Player: ${player.name} can publish to leaderboard`,
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Player',
                        `Cannot allow ${player.name} to publish to leaderboard: ${err.message}`,
                    );
                }
            })
    }


    forbidLeaderboardWithConfirm(player) {
        this
            ._modalsService.confirm$(
            'Player',
            `Do you want to block player '${player.name}' submission and remove all his previous submissions ?`
        )
            .subscribe((confirmation) => {
                if (!confirmation) {
                    return;
                }

                this._forbidLeaderboard(player);
            })
        ;
    }


    private _forbidLeaderboard(player) {
        this._competitionsService
            .forbidLeaderboard$(this._competitionId, player.sub)
            .subscribe({
                next: () => {
                    player.allow_leaderboard = false;

                    this._informationsService.success(
                        'Player',
                        `Player: ${player.name} cannot publish to leaderboard`,
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Player',
                        `Cannot forbid ${player.name} to publish to leaderboard: ${err.message}`,
                    );
                }
            })
    }
}
