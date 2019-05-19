import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {MaterialCreate} from "../../../../model/materials/material.model";
import {MaterialsService} from "../../../../model/materials/materials.service";
import {InformationsService} from "../../../../common/informations/informations.service";

import {text2date, date2text, PATTERN_DATE} from '../../../../common/helpers';
import {HasModification} from "../../../../common/modals/confirm/confirm.guard";


@Component({
    templateUrl: './material-update.component.html',
    styleUrls: ['./material-update.component.scss']
})
export class MaterialUpdateComponent implements OnInit, HasModification {

    form: FormGroup;

    private _competitionId: string;
    private _materialId: string;

    codemirrorConfigHtml: object = {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'text/html',
    };

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _formBuilder: FormBuilder,
                private _materialsService: MaterialsService,
                private _informationsService: InformationsService) {
        this.form = this._formBuilder.group({
            filename: [void 0, Validators.required],
            release_at: [void 0, Validators.compose([
                Validators.pattern(PATTERN_DATE),
            ])],
            description: [void 0],
        });
    }


    get filename() {
        return this.form.get('filename');
    }

    get release_at() {
        return this.form.get('release_at');
    }

    get description() {
        return this.form.get('description');
    }

    get material(): MaterialCreate {
        return new MaterialCreate(
            this.form.value.filename,
            text2date(this.form.value.release_at),
            this.form.value.description,
        );
    }


    set material(newMaterial: MaterialCreate) {
        this.form.patchValue({
            filename: newMaterial.filename,
            release_at: date2text(newMaterial.release_at),
            description: newMaterial.description,
        });
    }


    ngOnInit() {
        this._competitionId = this._route.snapshot.parent.params['competitionId'];
        this._materialId = this._route.snapshot.params['materialId'];

        this
            ._materialsService
            .getMaterialById$(this._competitionId, this._materialId)
            .subscribe({
                next: (material) => {
                    this.material = material;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Material',
                        `Cannot get material ${this._materialId}: ${err.message}`,
                    );
                }
            })
        ;
    }


    updateProcessing: boolean = false;

    update() {
        this.updateProcessing = true;

        this
            ._materialsService.updateMaterialById$(this._competitionId, this._materialId, this.material)
            .finally(() => {
                this.updateProcessing = false;
            })
            .subscribe({
                next: (newMaterial) => {
                    this.material = newMaterial;
                    this.form.markAsPristine();

                    this._informationsService.success(
                        'Material',
                        'Material Updated'
                    );
                },
                error: (err) => {
                    console.error('Update Error:', err);

                    this._informationsService.error('Update Error', err.error);
                }
            })
        ;
    }





    isModified(): boolean {
        return !this.form.pristine;
    }
}
