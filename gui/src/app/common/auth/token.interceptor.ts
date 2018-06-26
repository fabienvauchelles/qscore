import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest, HttpEvent} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import {AuthService} from './auth.service';



@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private _authService: AuthService) {
    }


    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {
        let reqNew: HttpRequest<any>;
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            if (this._authService.authenticated) {
                reqNew = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${this._authService.accessToken}`,
                    }
                });
            }
            else {
                reqNew = req;
            }
        }
        else {
            reqNew = req;
        }

        return next.handle(reqNew);
    }
}
