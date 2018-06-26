import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {EventsService, EventType} from '../common/events/events.service';
import {InformationsService} from '../common/informations/informations.service';
import {LeadsService} from '../model/leads/leads.service';
import {Lead} from '../model/leads/lead.model';
import {Competition} from '../model/competitions/competiton.model';
import {CompetitionsService} from '../model/competitions/competitions.service';



@Component({
    template: '<leaderboard [competition]="competition" [leads]="leads" *ngIf="competition"></leaderboard>'
})
export class LeaderboardContainerComponent implements OnInit, OnDestroy {

    competition: Competition;
    leads: Lead[] = [];

    private _competitionId: string;
    private _subscription: Subscription = new Subscription();

    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _eventsService: EventsService,
                private _competitionsService: CompetitionsService,
                private _leadsService: LeadsService,
                private _informationsService: InformationsService) {
    }


    ngOnInit() {
        this._competitionId = this._route.snapshot.params['competitionId'];

        // Listen events
        this._subscription.add(this._eventsService.event$.subscribe((event) => {
            if (!event) {
                return;
            }

            switch (event.type) {
                case EventType.LEADERBOARD_UPDATED: {
                    this._refreshLeads();

                    break;
                }
            }
        }));

        this._eventsService.register(this._competitionId, 'leaderboard');

        this
            ._competitionsService
            .getCompetitionLeaderboardInfosById$(this._competitionId)
            .subscribe({
                next: (competition) => {
                    this.competition = competition;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Competition',
                        `Cannot get competition ${this._competitionId}: ${err.message}`,
                    );
                }
            })
        ;

        this._refreshLeads();
    }


    ngOnDestroy() {
        // Unregister event
        this._eventsService.unregister(this._competitionId, 'leaderboard');

        // Unsubscribe event
        this._subscription.unsubscribe();
    }


    private _refreshLeads() {
        this
            ._leadsService
            .getAllLeads$(this._competitionId)
            .subscribe({
                next: (leadsPaginated) => {
                    this.leads = leadsPaginated.leads;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Leaderboard',
                        `Cannot get leads: ${err.message}`,
                    );
                }
            })
        ;
    }
}
