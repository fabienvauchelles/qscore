import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CompetitionsService} from '../model/competitions/competitions.service';
import {Competition} from '../model/competitions/competiton.model';
import {EventCompetitionSelected, EventsService} from '../common/events/events.service';
import {InformationsService} from '../common/informations/informations.service';
import {AuthService} from '../common/auth/auth.service';



@Component({
    templateUrl: './competitions.component.html',
    styleUrls: ['./competitions.component.scss']
})
export class CompetitionsComponent implements OnInit {

    competitionsRegistered: Competition[] = [];
    competitionsUnregistered: Competition[] = [];


    constructor(public authService: AuthService,
                private _router: Router,
                private _competitionsService: CompetitionsService,
                private _eventsService: EventsService,
                private _informationsService: InformationsService) {

    }


    ngOnInit() {
        this._eventsService.emit(new EventCompetitionSelected(void 0));

        this._refreshCompetitions();
    }


    view(competition: Competition) {
        this._router.navigate(
            ['/competitions', competition.id],
        );
    }


    register(competition: Competition) {
        this._router.navigate(
            ['/competitions/join', competition.id],
        );
    }


    private _refreshCompetitions() {
        this
            ._competitionsService
            .getAllCompetitions$()
            .subscribe({
                next: (competitions) => {
                    this.competitionsRegistered = competitions.filter(
                        (competition) => competition.token
                    );

                    this.competitionsUnregistered = competitions.filter(
                        (competition) => !competition.token
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Competitions',
                        `Cannot get competitions: ${err.message}`,
                    );
                }
            })
        ;
    }
}
