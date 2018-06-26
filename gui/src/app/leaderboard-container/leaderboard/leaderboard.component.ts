import {Component, OnInit, Input, NgZone} from '@angular/core';
import * as ejs from 'ejs';
import * as moment from 'moment';
import {Lead} from '../../model/leads/lead.model';
import {Competition} from '../../model/competitions/competiton.model';



@Component({
    selector: 'leaderboard',
    template: '<div [innerHTML]="leaderboardHtml"></div>',
})
export class LeaderboardComponent implements OnInit {

    @Input('competition')
    set competition(val: Competition) {
        window.qscore = window.qscore || {};
        window.qscore.competition = val;

        this._updateTemplate(val);
    }

    get competition() {
        if (!window.qscore) {
            return;
        }

        return window.qscore.competition;
    }


    @Input('leads')
    set leads(val: Lead[]) {
        window.qscore = window.qscore || {};
        window.qscore.leads = val;
    }

    get leads() {
        if (!window.qscore) {
            return;
        }

        return window.qscore.leads;
    }


    private _templateHtml: string;
    leaderboardHtml = '';


    constructor(private _zone: NgZone) {
    }


    ngOnInit() {
        const self = this;

        // Create tooling library
        window.qscore = window.qscore || {};

        window.qscore.render = function render(data) {
            if (!self._templateHtml || self._templateHtml.length < 0) {
                return;
            }

            self._zone.runOutsideAngular(() => {
                self.leaderboardHtml = ejs.render(self._templateHtml, data);
            });
        };

        window.qscore.getRemainingTime = function getRemainingTime(date) {
            const diff = self._getDiff(moment(), date);

            return self._formatDiff(diff);
        };

        window.qscore.formatDate = function formatDate(date) {
            return moment(date).format('DD/MM/YY HH:mm:ss');
        };
    }


    private _updateTemplate(competition: Competition) {
        this._templateHtml = competition.leaderboard_html;
        this._updateCss(competition.leaderboard_css);
        this._updateJs(competition.leaderboard_js);
    }


    private _updateCss(code: string) {
        if (!code || code.length < 0) {
            return;
        }

        let style = <HTMLStyleElement>document.getElementById('leaderboardstyle');
        if (!style) {
            const head = document.getElementsByTagName('head')[0];

            style = document.createElement('style');
            style.id = 'leaderboardstyle';

            head.appendChild(style);
        }

        style.innerHTML = code;
    }


    private  _updateJs(code) {
        if (!code || code.length < 0) {
            return;
        }

        const head = document.getElementsByTagName('head')[0];

        let script = <HTMLScriptElement>document.getElementById('leaderboardscript');
        if (script) {
            head.removeChild(script);
        }

        script = document.createElement('script');
        script.id = 'leaderboardscript';
        script.innerHTML = code;

        head.appendChild(script);
    }


    private _getDiff(dt1, dt2) {
        const
            SECOND_IN_MS = 1000,
            MINUTE_IN_MS = SECOND_IN_MS * 60,
            HOUR_IN_MS = MINUTE_IN_MS * 60,
            DAY_IN_MS = HOUR_IN_MS * 24;

        let remaining = moment(dt2).diff(dt1);

        const result: any = {};

        result.days = Math.floor(remaining / DAY_IN_MS);
        remaining -= result.days * DAY_IN_MS;

        result.hours = Math.floor(remaining / HOUR_IN_MS);
        remaining -= result.hours * HOUR_IN_MS;

        result.minutes = Math.floor(remaining / MINUTE_IN_MS);
        remaining -= result.minutes * MINUTE_IN_MS;

        result.seconds = Math.floor(remaining / SECOND_IN_MS);
        remaining -= result.seconds * SECOND_IN_MS;

        result.milliseconds = remaining;

        return result;
    }


    private _formatDiff(d) {
        const texts = [];

        // Final countdown
        if (d.days <= 0 &&
            d.hours <= 0 &&
            d.minutes <= 0 &&
            d.seconds <= 10) {
            return `${d.seconds}.${this._formatNumberLength(d.milliseconds, 3)}`;
        }

        if (d.days > 0) {
            if (d.days === 1) {
                texts.push('1 day');
            } else {
                texts.push(`${d.days} days`);
            }
        }

        if (d.hours > 0) {
            if (d.hours === 1) {
                texts.push('1 hour');
            } else {
                texts.push(`${d.hours} hours`);
            }
        }

        if (d.minutes > 0) {
            if (d.minutes === 1) {
                texts.push('1 minute');
            } else {
                texts.push(`${d.minutes} minutes`);
            }
        }

        if (d.seconds > 1) {
            texts.push(`${d.seconds} seconds`);
        } else {
            texts.push(`${d.seconds} second`);
        }

        switch (texts.length) {
            case 0: {
                return '0 second';
            }

            case 1: {
                return texts[0];
            }

            case 2: {
                return `${texts[0]} and ${texts[1]}`;
            }

            case 3: {
                return `${texts[0]}, ${texts[1]} and ${texts[2]}`;
            }

            case 4: {
                return `${texts[0]}, ${texts[1]}, ${texts[2]} and ${texts[3]}`;
            }
        }
    }


    private _formatNumberLength(num, length) {
        let r = Math.trunc(num).toString();
        while (r.length < length) {
            r = `0${r}`;
        }
        return r;
    }
}
