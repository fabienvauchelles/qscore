import * as _ from 'lodash';
import * as moment from 'moment';
import {Component, OnInit} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import {EventsService} from './common/events/events.service';
import {AuthService} from './common/auth/auth.service';
import {InformationsService} from './common/informations/informations.service';

declare global {
    interface Window {
        _: any,
        moment: any,
        qscore: any,
    }
}


@Component({
    // tslint:disable-next-line
    selector: 'body',
    template: `
        <router-outlet></router-outlet>
        <modals></modals>
        <toaster-container [toasterconfig]="informationsService.config"></toaster-container>
    `
})
export class AppComponent implements OnInit {
    constructor(public informationsService: InformationsService,
                private _router: Router,
                eventsService: EventsService,
                authService: AuthService) {

        window._ = _;
        window.moment = moment;
        window.qscore = {};

        eventsService.init();
        authService.init();
    }


    ngOnInit() {
        this._router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0)
        });
    }
}
