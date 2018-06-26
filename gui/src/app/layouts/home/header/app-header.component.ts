import {Component} from '@angular/core';
import {AuthService} from '../../../common/auth/auth.service';



@Component({
    selector: 'app-header',
    templateUrl: './app-header.component.html'
})
export class AppHeaderComponent {
    constructor(private _authService: AuthService) {

    }


    get name() {
        const profile = this._authService.profile;
        if (!profile) {
            return;
        }

        return profile.name;
    }


    get pictureUrl() {
        const profile = this._authService.profile;
        if (!profile) {
            return;
        }

        return profile.picture_url;
    }


    logout() {
        this._authService.logout();
    }
}
