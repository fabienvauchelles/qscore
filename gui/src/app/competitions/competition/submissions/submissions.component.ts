import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Submission} from "../../../model/submissions/submission.model";
import {SubmissionsService} from "../../../model/submissions/submissions.service";
import {CompetitionsService} from "../../../model/competitions/competitions.service";
import {Competition, CompetitionRank} from "../../../model/competitions/competiton.model";
import {EventsService, EventType} from "../../../common/events/events.service";
import {Subscription} from "rxjs/Subscription";
import {InformationsService} from "../../../common/informations/informations.service";


@Component({
    templateUrl: './submissions.component.html',
    styleUrls: ['./submissions.component.scss']
})
export class SubmissionsComponent implements OnInit, OnDestroy {

    bestSubmissionScore: number;
    rank: CompetitionRank;
    token: string;
    submissions: Submission[] = [];

    currentPage = 1;
    itemsPerPage = 8;
    maxSize = 15;
    totalItems = 0;

    private _competitionId: string;
    private _subscription: Subscription = new Subscription();


    constructor(private _route: ActivatedRoute,
                private _router: Router,
                private _eventsService: EventsService,
                private _competitionsService: CompetitionsService,
                private _informationsService: InformationsService,
                private _submissionsService: SubmissionsService) {
    }


    ngOnInit() {
        this._competitionId = this._route.snapshot.parent.params['competitionId'];

        // Listen events
        this._subscription.add(this._eventsService.event$.subscribe((event) => {
            if (!event) {
                return;
            }

            switch (event.type) {
                case EventType.SUBMISSIONS_VALID:
                case EventType.SUBMISSIONS_INVALID:
                case EventType.SUBMISSIONS_SUBMITTED: {
                    this.currentPage = 1;

                    this._refreshSubmissions();

                    break;
                }

                case EventType.LEADERBOARD_UPDATED: {
                    this._refreshRank();

                    break;
                }
            }
        }));

        this
            ._competitionsService
            .getCompetitionById$(this._competitionId, ['token'])
            .subscribe({
                next: (competition) => {
                    this.token = competition.token;

                    this._eventsService.register(this._competitionId, `submissions::${this.token}`);

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

        this._refreshSubmissions();
        this._refreshRank();
    }


    ngOnDestroy() {
        // Unregister event
        this._eventsService.unregister(this._competitionId, `submissions::${this.token}`);

        // Unsubscribe event
        this._subscription.unsubscribe();
    }


    updateSubmissionsPage($event) {
        if ($event) {
            this.currentPage = $event.page;
        }

        const offset = (this.currentPage - 1) * this.itemsPerPage;

        this
            ._submissionsService
            .getAllSubmissions(this._competitionId, offset, this.itemsPerPage)
            .subscribe({
                next: (submissionsPaginated) => {
                    this.totalItems = submissionsPaginated.totalCount;
                    this.submissions = submissionsPaginated.submissions;
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Submissions',
                        `Cannot get all submissions: ${err.message}`,
                    );
                }
            })
        ;
    }


    private _refreshSubmissions() {
        this
            ._submissionsService
            .getBestSubmissionScore(this._competitionId)
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

        this.updateSubmissionsPage(void 0);
    }


    private _refreshRank() {
        this
            ._competitionsService
            .getCompetitionRankById$(this._competitionId)
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
    }
}
