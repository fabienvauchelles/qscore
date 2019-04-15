import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from '../common/auth/auth.service';
import {InformationsService} from '../common/informations/informations.service';
import {PlayerCreate} from "../model/players/player.model";


const
    PATTERN_URL = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;


@Component({
    templateUrl: './player-create.component.html',
    styleUrls: ['./player-create.component.scss']
})
export class PlayerCreateComponent implements OnInit {

    form: FormGroup;
    authResult: any;

    constructor(private _router: Router,
                private _authService: AuthService,
                private _informationsService: InformationsService,
                protected _formBuilder: FormBuilder) {

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


    get player(): PlayerCreate {
        return new PlayerCreate(
            this.form.value.name,
            this.form.value.picture_url,
        );
    }


    set player(newPlayer: PlayerCreate) {
        this.form.patchValue({
            name: newPlayer.name,
            picture_url: newPlayer.picture_url,
        });
    }


    completed: boolean = true;

    ngOnInit(): void {
        this._authService
            .parseHash()
            .then((authResult) => {
                this.authResult = authResult;

                this._authService
                    .registerMe(this.authResult, null)
                    .then(() => {
                        this._router.navigate(['/']);
                    })
                    .catch(() => {
                        this.player = new PlayerCreate(
                            this.authResult.idTokenPayload.name,
                            this.authResult.idTokenPayload.picture,
                        );

                        this.completed = false;
                    })
                ;
            })
            .catch((err) => {
                console.error('Error:', err);

                if (err.errorDescription) {
                    this._informationsService.error(
                        err.error,
                        err.errorDescription
                    );
                } else {
                    this._informationsService.error(
                        'Login Error',
                        err.error,
                    );
                }

                // Retry login after 5 seconds
                setTimeout(() => {
                    this._authService.logout();
                }, 5000);
            })
        ;
    }


    registerProcessing: boolean = false;

    register() {
        if (!this.player) {
            return;
        }

        this.registerProcessing = true;

        this._authService
            .registerMe(this.authResult, this.player)
            .then(() => {
                this._router.navigate(['/']);
            })
            .catch((err) => {
                console.error('Error:', err);

                if (err.errorDescription) {
                    this._informationsService.error(
                        err.error,
                        err.errorDescription
                    );
                } else {
                    this._informationsService.error(
                        'Login Error',
                        err.error,
                    );
                }

                // Retry login after 5 seconds
                setTimeout(() => {
                    this._authService.logout();
                }, 5000);
            })
        ;
    }
}
