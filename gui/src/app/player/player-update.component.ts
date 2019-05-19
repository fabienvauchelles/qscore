import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {InformationsService} from '../common/informations/informations.service';
import {ModalsService} from '../common/modals/modals.service';
import {PlayerUpdate} from '../model/players/player.model';
import {AuthService} from "../common/auth/auth.service";
import {HasModification} from "../common/modals/confirm/confirm.guard";


const
    PATTERN_URL = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;


@Component({
    templateUrl: './player-update.component.html',
    styleUrls: ['./player-update.component.scss']
})
export class PlayerUpdateComponent implements OnInit, HasModification {

    form: FormGroup;

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _formBuilder: FormBuilder,
                private _authService: AuthService,
                private _informationsService: InformationsService,
                private _modalsService: ModalsService) {
        this.form = this._formBuilder.group({
            name: [void 0, Validators.required],
            picture_url: [void 0, Validators.compose([
                Validators.required,
                Validators.pattern(PATTERN_URL),
            ])],
        });
    }


    get name() {
        return this.form.get('name');
    }

    get picture_url() {
        return this.form.get('picture_url');
    }


    get player(): PlayerUpdate {
        return new PlayerUpdate(
            this.form.value.name,
            this.form.value.picture_url,
        );
    }


    set player(newPlayer: PlayerUpdate) {
        this.form.patchValue({
            name: newPlayer.name,
            picture_url: newPlayer.picture_url,
        });
    }


    ngOnInit() {
        this.player = this._authService.profile;
    }


    updateWithConfirm() {
        this
            ._modalsService.confirm$(
            'Player',
            'Do you want to modify your profile?'
        )
            .subscribe((confirmation) => {
                if (!confirmation) {
                    return;
                }

                this._update();
            })
        ;
    }


    updateProcessing: boolean = false;

    _update() {
        if (!this.player) {
            return;
        }

        this.updateProcessing = true;

        this
            ._authService
            .updateMe$(this.player)
            .finally(() => {
                this.updateProcessing = false;
            })
            .subscribe({
                next: (newPlayer) => {
                    this.player = newPlayer;
                    this.form.markAsPristine();

                    this._informationsService.success(
                        'Player',
                        'Profile Updated'
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
