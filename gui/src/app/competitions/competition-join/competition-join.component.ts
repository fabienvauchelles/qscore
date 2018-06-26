import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CompetitionsService} from '../../model/competitions/competitions.service';
import {Competition} from '../../model/competitions/competiton.model';
import {InformationsService} from '../../common/informations/informations.service';



@Component({
    templateUrl: './competition-join.component.html',
    styleUrls: ['./competition-join.component.scss']
})
export class CompetitionJoinComponent implements OnInit {

    public competition: Competition;
    public password: string;

    private _competitionId: string;


    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _competitionsService: CompetitionsService,
                private _informationsService: InformationsService) {
    }


    ngOnInit() {
        this._competitionId = this._route.snapshot.params['competitionId'];

        this
            ._competitionsService
            .getCompetitionRulesById$(this._competitionId)
            .subscribe({
                next: (competition) => {
                    this.competition = competition;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Competition',
                        `Cannot get competition ${this._competitionId}: ${err.message}`,
                    );
                }
            })
        ;
    }


    accept() {
        this
            ._competitionsService
            .registerCompetition$(this.competition.id, this.password)
            .subscribe({
                next: () => {
                    this._router.navigate(
                        ['/competitions', this.competition.id],
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    if (err.status === 403) {
                        this._informationsService.error(
                            'Competition not accessible',
                            err.error,
                        );
                    } else {
                        this._informationsService.error(
                            'Competition Register',
                            `Cannot register competition: ${err.message}`,
                        );
                    }
                }
            })
        ;
    }


    refuse() {
        this._router.navigate(
            ['/competitions'],
        );
    }
}
