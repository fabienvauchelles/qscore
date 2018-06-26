import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import {AuthService} from './auth.service';



@Injectable()
export class LoginInterceptor implements HttpInterceptor {
    constructor(private _authService: AuthService) {
    }


    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {
        return next
            .handle(req)
            .do(void 0,
                err => {
                    if (err instanceof HttpErrorResponse) {
                        if (err.status === 401) {
                            this._authService.logout();
                            return;
                        }
                    }

                    throw err;
                })
            ;
    }
}
