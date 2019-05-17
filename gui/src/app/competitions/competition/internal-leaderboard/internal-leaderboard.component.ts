import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {EventsService, EventType} from '../../../common/events/events.service';
import {InformationsService} from '../../../common/informations/informations.service';
import {Lead} from '../../../model/leads/lead.model';
import {LeadsService} from '../../../model/leads/leads.service';
import {CompetitionRank} from '../../../model/competitions/competiton.model';
import {CompetitionsService} from '../../../model/competitions/competitions.service';
import {SubmissionsService} from '../../../model/submissions/submissions.service';



@Component({
    templateUrl: './internal-leaderboard.component.html',
    styleUrls: ['./internal-leaderboard.component.scss']
})
export class InternalLeaderboardComponent implements OnInit, OnDestroy {

    bestSubmissionScore: number;
    rank: CompetitionRank;
    competitionId: string;
    leads: Lead[] = [];

    currentPage = 1;
    itemsPerPage = 8;
    totalItems = 0;

    registerStrategyType: number;


    private _subscription: Subscription = new Subscription();


    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _eventsService: EventsService,
                private _competitionsService: CompetitionsService,
                private _leadsService: LeadsService,
                private _informationsService: InformationsService,
                private _submissionsService: SubmissionsService) {
    }


    ngOnInit() {
        this.competitionId = this._route.snapshot.parent.params['competitionId'];

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

                case EventType.SUBMISSIONS_VALID:
                case EventType.SUBMISSIONS_INVALID:
                case EventType.SUBMISSIONS_SUBMITTED: {
                    this._refreshBestSubmissionScore();

                    break;
                }
            }
        }));

        this._eventsService.register(this.competitionId, 'leaderboard');

        this._refreshLeads();
        this._refreshBestSubmissionScore();
    }


    ngOnDestroy() {
        // Unregister event
        this._eventsService.unregister(this.competitionId, 'leaderboard');

        // Unsubscribe event
        this._subscription.unsubscribe();
    }


    trackByLead(lead: Lead) {
        return lead.hash;
    }


    updateLeadsPage($event) {
        if ($event) {
            this.currentPage = $event.page;
        }

        const offset = (this.currentPage - 1) * this.itemsPerPage;

        this
            ._leadsService
            .getAllLeads$(this.competitionId, offset, this.itemsPerPage)
            .subscribe({
                next: (leadsPaginated) => {
                    this.totalItems = leadsPaginated.totalCount;
                    this.registerStrategyType = leadsPaginated.registerStrategyType;
                    this.leads = leadsPaginated.leads;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Internal Leaderboard',
                        `Cannot get all leads: ${err.message}`,
                    );
                }
            })
        ;
    }


    private _refreshLeads() {
        this
            ._competitionsService
            .getCompetitionRankById$(this.competitionId)
            .subscribe({
                next: (rank) => {
                    this.rank = rank;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Rank',
                        `Cannot get rank: ${err.message}`,
                    );
                }
            })
        ;

        this.updateLeadsPage(void 0);
    }


    private _refreshBestSubmissionScore() {
        this
            ._submissionsService
            .getBestSubmissionScore(this.competitionId)
            .subscribe({
                next: (score) => {
                    this.bestSubmissionScore = score;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Submissions',
                        `Cannot get best submission: ${err.message}`,
                    );
                }
            })
        ;
    }
}
