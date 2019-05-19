import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CompetitionsService} from '../../../model/competitions/competitions.service';
import {Competition} from '../../../model/competitions/competiton.model';
import {InformationsService} from '../../../common/informations/informations.service';
import {MaterialsService} from '../../../model/materials/materials.service';
import {Material} from '../../../model/materials/material.model';
import {AuthService} from '../../../common/auth/auth.service';



@Component({
    templateUrl: './materials.component.html',
    styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {

    competition: Competition;
    materials: Material[];

    private _competitionId: string;


    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _competitionsService: CompetitionsService,
                private _materialsService: MaterialsService,
                private _informationsService: InformationsService,
                private _authService: AuthService) {
    }


    ngOnInit() {
        this._competitionId = this._route.snapshot.parent.params['competitionId'];

        this
            ._competitionsService
            .getCompetitionById$(this._competitionId, ['materials_description'])
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

        this
            ._materialsService
            .getAllMaterials$(this._competitionId)
            .subscribe({
                next: (materials) => {
                    this.materials = materials;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Competition',
                        `Cannot get materials: ${err.message}`,
                    );
                }
            })
        ;
    }


    getLink(material) {
        return `/api/competitions/${this.competition.id}/materials/${material.id}/download?token=${this._authService.accessToken}`;
    }
}
