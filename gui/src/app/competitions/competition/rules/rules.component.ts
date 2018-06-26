import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CompetitionsService} from '../../../model/competitions/competitions.service';
import {Competition} from '../../../model/competitions/competiton.model';
import {InformationsService} from '../../../common/informations/informations.service';



@Component({
    templateUrl: './rules.component.html',
    styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {

    competition: Competition;

    private _competitionId: string;


    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _competitionsService: CompetitionsService,
                private _informationsService: InformationsService) {
    }


    ngOnInit() {
        this._competitionId = this._route.snapshot.parent.params['competitionId'];

        this
            ._competitionsService
            .getCompetitionById$(this._competitionId, ['rules'])
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
}
