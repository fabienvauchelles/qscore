import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/mergeMap';
import {Injectable} from '@angular/core';
import * as auth0 from 'auth0-js';
import {environment} from '../../../environments/environment';
import {PlayersService} from '../../model/players/players.service';
import {PlayerCreate} from "../../model/players/player.model";



@Injectable()
export class AuthService {

    private _refreshSubscription: any;
    private _auth0: any;


    constructor(private _playersService: PlayersService) {
        // Create Auth0 web auth instance
        this._auth0 = new auth0.WebAuth({
            clientID: environment.qsAuthPlayerClientId,
            domain: environment.qsAuthPlayerDomain,
            responseType: 'token id_token',
            redirectUri: environment.qsAuthPlayerRedirectUri,
            audience: environment.qsAuthPlayerAudience,
            scope: 'openid profile email',
        });
    }


    get profile() {
        const profileData = localStorage.getItem('profile');
        return JSON.parse(profileData);
    }


    get accessToken() {
        return localStorage.getItem('access_token');
    }


    get authenticated(): boolean {
        // Check if current date is greater than expiration and player is logged in
        const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        if (!expiresAt) {
            return false;
        }

        return Date.now() < expiresAt;
    }


    get admin() {
        try {
            const grantedScopes = JSON.parse(localStorage.getItem('scopes'));
            return grantedScopes.indexOf('admin') >= 0;
        } catch (err) {
            return false;
        }
    }


    logout() {
        console.log('[AuthService] logout()');

        // Remove tokens and expiry time from localStorage
        localStorage.removeItem('profile');
        localStorage.removeItem('access_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('scopes');

        // Unschedule renewal
        this._unscheduleRenewal();

        // Go back to the home route
        this._auth0.authorize();
    }


    parseHash(): any {
        return new Promise((resolve, reject) => {
            // When Auth0 hash parsed, get profile
            this._auth0.parseHash((err, authResult) => {
                if (err) {
                    return reject(err);
                }

                return resolve(authResult);
            });
        });
    }


    registerMe(authResult: any, player: PlayerCreate) {
        console.log('[AuthService] registerMe()');

        return new Promise((resolve, reject) => {
            this._playersService.registerMe$(authResult.idToken, player)
                .subscribe({
                    next: (profile) => {
                        this._saveAuthResult(authResult, profile);

                        this._scheduleRenewal();

                        return resolve();
                    },
                    error: (err) => reject(err)
                })
            ;
        });
    }


    private _saveAuthResult(authResult, profile) {
        if (!authResult ||
            !authResult.accessToken ||
            !profile) {
            return;
        }

        // Set the time that the access token will expire at
        const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        localStorage.setItem('expires_at', expiresAt);

        localStorage.setItem('access_token', authResult.accessToken);

        const profileData = JSON.stringify(profile);
        localStorage.setItem('profile', profileData);

        const scopes = decodeURIComponent(authResult.scope || '');
        localStorage.setItem('scopes', JSON.stringify(scopes.split(' ')));
    }


    private _scheduleRenewal() {
        if (!this.authenticated) {
            return;
        }

        this._unscheduleRenewal();

        console.log('[AuthService] _scheduleRenewal()');

        const expiresAt = JSON.parse(localStorage.getItem('expires_at'));

        const source = Observable.of(expiresAt).flatMap(expAt => {
            const now = Date.now();

            // Use the delay in a timer to
            // run the refresh at the proper time
            return Observable.timer(Math.max(1, expAt - now));
        });

        // Once the delay time from above is
        // reached, get a new JWT and schedule
        // additional refreshes
        this._refreshSubscription = source.subscribe(() => {
            this._renewToken();
            this._scheduleRenewal();
        });
    }


    private _unscheduleRenewal() {
        if (!this._refreshSubscription) {
            return;
        }

        console.log('[AuthService] _unscheduleRenewal()');

        this._refreshSubscription.unsubscribe();
    }


    private _renewToken() {
        console.log('[AuthService] _renewToken()');

        this._auth0.checkSession({}, (err, authResult) => {
            if (err) {
                console.error('[AuthService] Error: cannot renew token:', err);
                this.logout();
                return;
            }

            this._saveAuthResult(authResult, this.profile);
        });
    }
}
