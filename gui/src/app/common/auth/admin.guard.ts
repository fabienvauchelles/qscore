import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';



@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private _router: Router,
                private _authService: AuthService) {
    }


    canActivate(route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean> | boolean {
        if (!this._authService.admin) {
            this._router.navigate(['/']);
            return false;
        }

        return true;
    }
}
