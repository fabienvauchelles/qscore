import {ActivatedRoute, Router} from '@angular/router';
import {CompetitionsService} from '../../../model/competitions/competitions.service';
import {Competition} from '../../../model/competitions/competiton.model';
import {InformationsService} from '../../../common/informations/informations.service';
import {FormBuilder} from '@angular/forms';
import 'codemirror/mode/htmlmixed/htmlmixed';
import {MaterialsService} from '../../../model/materials/materials.service';
import {Material} from '../../../model/materials/material.model';
import {ModalsService} from '../../../common/modals/modals.service';
import {CompetitionEditComponent} from './competition-edit.component';
import {Component} from '@angular/core';



@Component({
    templateUrl: './competition-edit.component.html',
    styleUrls: ['./competition-edit.component.scss']
})
export class CompetitionUpdateComponent extends CompetitionEditComponent {

    datafile: File;
    materials: Material[];

    private _competitionId: string;


    constructor(_route: ActivatedRoute,
                _router: Router,
                _formBuilder: FormBuilder,
                private _competitionsService: CompetitionsService,
                private _materialsService: MaterialsService,
                private _informationsService: InformationsService,
                private _modalsService: ModalsService) {
        super(_route, _router, _formBuilder, true);
    }

    ngOnInit() {
        super.ngOnInit();

        this._competitionId = this._route.snapshot.parent.params['competitionId'];

        this
            ._competitionsService
            .getCompetitionById$(this._competitionId)
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

        this._refreshMaterials();
    }


    edit() {
        super.edit();

        this
            ._competitionsService.updateCompetitionById$(this._competitionId, this.competition)
            .finally(() => {
                this.editProcessing = false;
            })
            .subscribe({
                next: (newCompetition) => {
                    this.competition = newCompetition;
                    this.form.markAsPristine();

                    this._informationsService.success(
                        'Competition',
                        'Competition Updated'
                    );
                },
                error: (err) => {
                    console.error('Update Error:', err);

                    this._informationsService.error('Update Error', err.error);
                }
            })
        ;
    }


    dataUpload(evt) {
        if (evt.target.files &&
            evt.target.files.length > 0) {
            this.datafile = evt.target.files[0];
        } else {
            this.datafile = void 0;
        }
    }


    addMaterial($event) {
        $event.preventDefault();

        if (!this.datafile) {
            return;
        }

        this
            ._materialsService
            .createMaterial(this._competitionId, this.datafile)
            .subscribe({
                next: () => {
                    this._refreshMaterials();

                    this._informationsService.success(
                        'Material Add',
                        'File added'
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Material Add',
                        `Cannot add material: ${err.message}`,
                    );
                }
            })
        ;
    }


    removeMaterialWithConfirm(material: Material, $event) {
        $event.preventDefault();

        this
            ._modalsService.confirm$(
            'Materials',
            `Do you want to delete material '${material.filename}' ?`
        )
            .subscribe((confirmation) => {
                if (!confirmation) {
                    return;
                }

                this._removeMaterial(material.id);
            })
        ;
    }


    private _removeMaterial(materialId: string) {
        this
            ._materialsService
            .removeMaterialById(this._competitionId, materialId)
            .subscribe({
                next: () => {
                    this._refreshMaterials();

                    this._informationsService.success(
                        'Material Remove',
                        'File removed'
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Material Remove',
                        `Cannot remove material: ${err.message}`,
                    );
                }
            })
        ;
    }


    private _refreshMaterials() {
        this
            ._materialsService
            .getAllMaterials(this._competitionId)
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
}
