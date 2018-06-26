import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';
import * as io from 'socket.io-client';
import {Competition} from '../../model/competitions/competiton.model';
import {Submission} from '../../model/submissions/submission.model';
import {AuthService} from '../auth/auth.service';



export enum EventType {
    COMPETITION_SELECTED,
    SUBMISSIONS_SUBMITTED,
    SUBMISSIONS_VALID,
    SUBMISSIONS_INVALID,
    LEADERBOARD_UPDATED,
}



interface Event {
    type: EventType;
}



export class EventCompetitionSelected implements Event {
    public type: EventType = EventType.COMPETITION_SELECTED;

    constructor(public competition: Competition) {
    }
}



export class EventSubmissionsSubmitted implements Event {
    public type: EventType = EventType.SUBMISSIONS_SUBMITTED;

    constructor() {
    }
}



export class EventSubmissionsValid implements Event {
    public type: EventType = EventType.SUBMISSIONS_VALID;

    constructor(public submission: Submission) {
    }
}



export class EventSubmissionsInvalid implements Event {
    public type: EventType = EventType.SUBMISSIONS_INVALID;

    constructor(public submission: Submission) {
    }
}



export class EventLeaderboardUpdated implements Event {
    public type: EventType = EventType.LEADERBOARD_UPDATED;

    constructor() {
    }
}



@Injectable()
export class EventsService {

    private _socket: any;
    private _namespacesByCompetition = new Map();
    private _eventSource = new Subject<Event>();
    event$ = this._eventSource.asObservable();


    constructor(private _authService: AuthService) {
    }


    emit(event: Event) {
        this._eventSource.next(event);
    }


    init() {
        console.log('[Events] _start()');

        this._socket = io('', {
            path: '/socket.io',
            transports: ['polling'],
        });


        // On connect, re-register all namespaces
        this._socket.on('connect', () => {
            this._onConnect();
        });


        this._socket.on('submissions::submitted', () => {
            this.emit(new EventSubmissionsSubmitted());
        });


        this._socket.on('submissions::valid', (rawSubmission) => {
            this.emit(new EventSubmissionsValid(Submission.fromJson(rawSubmission)));
        });


        this._socket.on('submissions::invalid', (rawSubmission) => {
            this.emit(new EventSubmissionsInvalid(Submission.fromJson(rawSubmission)));
        });


        this._socket.on('leaderboard::updated', () => {
            this.emit(new EventLeaderboardUpdated());
        });
    }


    register(competitionId, namespace) {
        console.log('[Events] register: competitionId=', competitionId, ' / namespace=', namespace);

        let namespaces = this._namespacesByCompetition.get(competitionId);
        if (!namespaces) {
            namespaces = new Set();
            this._namespacesByCompetition.set(competitionId, namespaces);
        }

        namespaces.add(namespace);

        if (this._socket) {
            this._socket.emit('register', {
                competitionId,
                namespace,
                access_token: this._authService.accessToken,
            });
        }
    }


    unregister(competitionId, namespace) {
        console.log('[Events] unregister: competitionId=', competitionId, ' / namespace=', namespace);

        const namespaces = this._namespacesByCompetition.get(competitionId);
        if (namespaces) {
            namespaces.delete(namespace);

            if (namespaces.length <= 0) {
                this._namespacesByCompetition.delete(competitionId);
            }
        }

        if (this._socket) {
            this._socket.emit('unregister', {
                competitionId,
                namespace,
                access_token: this._authService.accessToken,
            });
        }
    }


    private _onConnect() {
        this._namespacesByCompetition.forEach((namespaces, competitionId) => {
            namespaces.forEach((namespace) => {
                this.register(competitionId, namespace);
            });
        });
    }
}
