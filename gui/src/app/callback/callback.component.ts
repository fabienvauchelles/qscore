import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../common/auth/auth.service';
import {InformationsService} from '../common/informations/informations.service';



@Component({
    templateUrl: './callback.component.html',
    styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

    constructor(private _router: Router,
                private _authService: AuthService,
                private _informationsService: InformationsService) {
    }

    ngOnInit(): void {
        this._authService
            .registerMe()
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
