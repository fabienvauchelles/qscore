import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CompetitionsService} from '../../../model/competitions/competitions.service';
import {Competition} from '../../../model/competitions/competiton.model';
import {InformationsService} from '../../../common/informations/informations.service';
import {ModalsService} from '../../../common/modals/modals.service';
import {AuthService} from '../../../common/auth/auth.service';


@Component({
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

    public competition: Competition;

    private _competitionId: string;

    constructor(public authService: AuthService,
                private _route: ActivatedRoute,
                private _router: Router,
                private _competitionsService: CompetitionsService,
                private _modalsService: ModalsService,
                private _informationsService: InformationsService) {
    }


    get submission_delay() {
        if (!this._competitionId) {
            return;
        }

        let count = 1000 / this.competition.submission_delay;
        if (count >= 1) {
            return `${Math.round(count)} / second`;
        }

        count = 60 * count;
        if (count >= 1) {
            return `${Math.round(count)} / minute`;
        }

        count = 60 * count;
        if (count >= 1) {
            return `${Math.round(count)} / hour`;
        }

        count = 24 * count;
        return `${Math.round(count)} / day`;
    }


    ngOnInit() {
        this._competitionId = this._route.snapshot.parent.params['competitionId'];

        this
            ._competitionsService
            .getCompetitionById$(this._competitionId, [
                'title', 'picture_url', 'players_count', 'description',
                'published', 'date_start', 'date_end', 'submission_delay',
            ])
            .subscribe({
                next: (competition) => {
                    this.competition = competition;
                },
                error: (err) => {
                    console.error('Error:', err);

                    if (err.status === 403) {
                        this._router.navigate(['/competitions', 'join', this._competitionId]);
                    }
                    else {
                        this._informationsService.error(
                            'Competition',
                            `Cannot get competition ${this._competitionId}: ${err.message}`,
                        );
                    }
                }
            })
        ;
    }


    unregisterWithConfirm() {
        this
            ._modalsService.confirm$(
            'Competition',
            'Do you really want to leave this competition ?'
        )
            .subscribe((confirmation) => {
                if (!confirmation) {
                    return;
                }

                this._unregister();
            })
        ;
    }


    private _unregister() {
        this
            ._competitionsService
            .unregisterCompetition$(this._competitionId)
            .subscribe({
                next: () => {
                    this._router.navigate(
                        ['/competitions'],
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Competition Unregister',
                        `Cannot unregister competition: ${err.message}`,
                    );
                }
            })
        ;
    }


    removeWithConfirm() {
        this
            ._modalsService.confirm$(
            'Competition',
            'Do you really want to delete this competition ?'
        )
            .subscribe((confirmation) => {
                if (!confirmation) {
                    return;
                }

                this._remove();
            })
        ;
    }


    _remove() {
        this
            ._competitionsService
            .removeCompetitionById$(this._competitionId)
            .subscribe({
                next: () => {
                    this._router.navigate(
                        ['/competitions'],
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Competition Removed',
                        `Cannot remove competition: ${err.message}`,
                    );
                }
            })
        ;
    }
}
