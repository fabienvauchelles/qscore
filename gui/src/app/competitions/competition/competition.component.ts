import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
    EventCompetitionSelected,
    EventsService,
    EventSubmissionsValid,
    EventSubmissionsInvalid,
    EventType
} from '../../common/events/events.service';
import {CompetitionsService} from '../../model/competitions/competitions.service';
import {Subscription} from 'rxjs/Subscription';
import {InformationsService} from '../../common/informations/informations.service';



@Component({
    template: '<router-outlet></router-outlet>'
})
export class CompetitionComponent implements OnInit, OnDestroy {

    private _competitionId: string;
    private _subscription: Subscription = new Subscription();


    constructor(private _route: ActivatedRoute,
                private _competitionsService: CompetitionsService,
                private _eventsService: EventsService,
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
                case EventType.SUBMISSIONS_SUBMITTED: {
                    this._informationsService.success(
                        'Submissions',
                        `Your submissions have been submitted`
                    );

                    break;
                }


                case EventType.SUBMISSIONS_VALID: {
                    const submissionValid = event as EventSubmissionsValid;

                    this._informationsService.success(
                        'Submissions',
                        `Your submission is valid (score: ${submissionValid.submission.score.toFixed(5)})`
                    );

                    break;
                }


                case EventType.SUBMISSIONS_INVALID: {
                    const submissionInvalid = event as EventSubmissionsInvalid;

                    this._informationsService.error(
                        'Submissions',
                        `Your submission is invalid: ${submissionInvalid.submission.error}`
                    );

                    break;
                }
            }
        }));

        // Register event
        this._eventsService.register(this._competitionId, 'competition');

        // Load competition
        this._route.params
            .switchMap((params) => {
                const competitionId = params['competitionId'];

                return this._competitionsService.getCompetitionById$(competitionId, [
                    'title_short', 'leaderboard_hidden'
                ]);
            })
            .subscribe((competition) => {
                this._eventsService.emit(new EventCompetitionSelected(competition));
            })
        ;
    }


    ngOnDestroy() {
        // Unregister event
        this._eventsService.unregister(this._competitionId, 'competition');

        // Unsubscribe event
        this._subscription.unsubscribe();
    }
}
