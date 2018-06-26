import {Component, OnDestroy, OnInit} from '@angular/core';
import {Competition} from '../../../model/competitions/competiton.model';
import {Subscription} from 'rxjs/Subscription';
import {EventCompetitionSelected, EventsService, EventType} from '../../../common/events/events.service';
import {AuthService} from '../../../common/auth/auth.service';



@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit, OnDestroy {

    competition: Competition;

    private _subscription: Subscription = new Subscription();


    constructor(private _eventsService: EventsService,
                public authService: AuthService) {
    }


    ngOnInit(): void {
        this._subscription.add(this._eventsService.event$.subscribe(event => {
            if (!event) {
                return;
            }

            switch (event.type) {
                case EventType.COMPETITION_SELECTED: {
                    const eventSelected = event as EventCompetitionSelected;

                    if (eventSelected.competition) {
                        this.competition = eventSelected.competition;
                    } else {
                        this.competition = void 0;
                    }

                    break;
                }
            }
        }));
    }


    ngOnDestroy(): void {
        this._subscription.unsubscribe();
    }
}
