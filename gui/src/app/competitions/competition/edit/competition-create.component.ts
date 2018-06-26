import * as moment from 'moment';
import {ActivatedRoute, Router} from '@angular/router';
import {CompetitionsService} from '../../../model/competitions/competitions.service';
import {Competition, CompetitionCreate} from '../../../model/competitions/competiton.model';
import {InformationsService} from '../../../common/informations/informations.service';
import {FormBuilder} from '@angular/forms';
import 'codemirror/mode/htmlmixed/htmlmixed';
import {CompetitionEditComponent} from './competition-edit.component';
import {Component} from '@angular/core';



const DEFAULT_LEADERBOARD_HTML = `<div class="leaderboard">
    <div class="leaderboard-header">
        <div class="leaderboard-logo">
            [Your Logo]
        </div>
    
        <div class="leaderboard-title"><%= competition.title %></div>
    
        <% if (competitionStatus === 'started') { %>
        <div class="leaderboard-timer">
            remaining <%= qscore.getRemainingTime(competition.date_end) %>
        </div>
        <% } %>
    
        <% if (competitionStatus === 'closed') { %>
        <div class="leaderboard-closed">
            competition closed on 
            <span class="leaderboard-closed-date">
                <%= qscore.formatDate(competition.date_end) %>
            </span>
        </div>
        <% } %>
    </div>
        
    <% if (competitionStatus !== 'ready') { %> 
    <div class="leaderboard-leads">
        <% leads.forEach(function(lead) {%>
        <div class="leaderboard-lead">
            <div class="leaderboard-lead-rank">
                <%= lead.rank %>
            </div>
    
            <div class="leaderboard-lead-name">
                <div class="leaderboard-lead-picture">
                    <img src="<%= lead.player_picture_url %>">
                </div>
    
                <div class="leaderboard-lead-text">
                    <%= lead.player_name %> <%= lead.player_sub %>
                </div>
            </div>
    
            <div class="leaderboard-lead-score">
                <%= lead.score.toFixed(5) %>
            </div>
        </div>
        <% }); %>
    </div>
    <% } %>
    
    <% if (competitionStatus === 'ready') { %>
    <div class="leaderboard-ready">
    
        Competition starts in <%= qscore.getRemainingTime(competition.date_start) %>
    </div>
    <% } %>
    
    <div class="leaderboard-footer">
        <div class="leaderboard-footer-left">
			@fabienv
        </div>
    
        <div class="leaderboard-footer-center">
			[Your Image]
        </div>
    
        <div class="leaderboard-footer-right">
            #FabienVauchelles
        </div>
    </div>
</div>`;

const DEFAULT_LEADERBOARD_CSS = `.leaderboard {
    position: absolute;
    top: 0; bottom: 0;
    left: 0; right: 0;

    display: flex;
    flex-flow: column;

    padding: 25px 0;

    background: #e8f4f9;
}


/* HEADER */

.leaderboard-header {
    display: flex;
    flex-flow: column;
    align-items: center;
}


.leaderboard-logo img {
    width: 150px;
}


.leaderboard-title {
    font-family: Ubuntu, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-weight: 600;
    font-size: 60px;

    white-space: nowrap;

    color: #291d4a;
}


/* TIMER */

.leaderboard-timer {
    font-size: 22px;

    color: #869fac;
}


.leaderboard-timer remaining-timer {
    margin-left: 5px;

    font-size: 28px;

    color: #3292db;
}


.leaderboard-closed {
    font-size: 22px;

    color: #f86c6b;
}


.leaderboard-closed-date {
    font-weight: bold;
}


.leaderboard-ready {
    display: flex;
    flex: 1;
    flex-flow: column;
    align-items: center;
    justify-content: center;

    font-size: 28px;
}


.leaderboard-ready remaining-timer {
    font-size: 60px;

    color: #3292db;
}


/* FOOTER */

.leaderboard-footer {
    display: flex;
    flex-flow: row;
    align-items: center;
}


.leaderboard-footer-left,
.leaderboard-footer-right {
    display: flex;
    flex: 1;

    font-size: 32px;
    font-weight: bold;
}


.leaderboard-footer-left {
    justify-content: center;

    margin-left: 40px;
}


.leaderboard-footer-right {
    justify-content: center;

    margin-right: 40px;
}


.leaderboard-footer-center img {
    width: 530px;
}


/* LEADS */

.leaderboard-leads {
    display: flex;
    flex: 1;
    flex-flow: column;

    margin: 40px 0;

    overflow-y: hidden;
}


.leaderboard-lead {
    display: flex;
    align-items: center;
    justify-content: center;

    height: 90px;
    min-height: 90px;

    margin-bottom: 20px;

    font-size: 35px;

    color: #fff;
}


.leaderboard-lead .leaderboard-lead-rank {
    width: 70px;
    height: 90px;

    padding-left: 10px;

    font-size: 58px;

    border-radius: 90px 0 0 90px;

    background: #3292db;
}


.leaderboard-lead .leaderboard-lead-name {
    width: 750px;
    height: 90px;
    margin-left: 15px;

    background: #3292db;
}


.leaderboard-lead .leaderboard-lead-picture img {
    width: 90px;
}


.leaderboard-lead .leaderboard-lead-text {
    margin-left: 15px;
}


.leaderboard-lead .leaderboard-lead-score {
    width: 200px;
    height: 90px;

    margin-left: 15px;
    padding-left: 30px;

    border-radius: 0 90px 90px 0;

    background: #3292db;
}


.leaderboard-lead:nth-child(n+4) {
    height: 60px;
    min-height: 60px;

    font-size: 23px;

    color: #291d4a;
}


.leaderboard-lead:nth-child(n+4) .leaderboard-lead-rank {
    width: 70px;
    height: 60px;

    padding-left: 7px;

    font-size: 38px;

    border-radius: 60px 0 0 60px;

    background: rgba(50,146,219,.33);
}


.leaderboard-lead:nth-child(n+4) .leaderboard-lead-name {
    width: 500px;
    height: 60px;
    margin-left: 10px;

    background: rgba(50,146,219,.33);
}


.leaderboard-lead:nth-child(n+4) .leaderboard-lead-picture img {
    width: 60px;
}


.leaderboard-lead:nth-child(n+4) .leaderboard-lead-text {
    margin-left: 10px;
}


.leaderboard-lead:nth-child(n+4) .leaderboard-lead-score {
    width: 133px;
    height: 60px;

    margin-left: 10px;
    padding-left: 20px;

    border-radius: 0 60px 60px 0;

    background: rgba(50,146,219,.33);
}


.leaderboard-lead-rank {
    display: flex;
    align-items: center;
    justify-content: center;

    font-family: Ubuntu, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-weight: 600;
}


.leaderboard-lead-name {
    display: flex;
    align-items: center;
}


.leaderboard-lead-picture img {
    height: auto;
}


.leaderboard-lead-text {
    font-weight: 600;
}


.leaderboard-lead-score {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}`;

const DEFAULT_LEADERBOARD_JS = `setInterval(() => {
    if (!qscore.competition ||
        !qscore.competition.date_start ||
        !qscore.competition.date_end ||
        !qscore.leads) {
        return;
    }
    
    const
        now = moment(),
        dateStart = moment(qscore.competition.date_start),
        dateEnd = moment(qscore.competition.date_end);

    let competitionStatus, leadsMax;
    if (now.isBefore(dateStart)) {
        competitionStatus = 'ready';
        leadsMax = 0;
    } else if (now.isBefore(dateEnd)) {
        competitionStatus = 'started';
        leadsMax = 5;
    } else {
        competitionStatus = 'closed';
        leadsMax = 3;
    }
    
    qscore.render({
        competitionStatus,
        competition: qscore.competition,
        leads: _.take(qscore.leads, leadsMax),
    });
}, 100);`;



@Component({
    templateUrl: './competition-edit.component.html',
    styleUrls: ['./competition-edit.component.scss']
})
export class CompetitionCreateComponent extends CompetitionEditComponent {

    constructor(_route: ActivatedRoute,
                _router: Router,
                _formBuilder: FormBuilder,
                private _competitionsService: CompetitionsService,
                private _informationsService: InformationsService) {
        super(_route, _router, _formBuilder, false);
    }


    ngOnInit() {
        super.ngOnInit();

        const
            start = moment(),
            end = start.clone().add(2, 'hour');


        this.competition = new CompetitionCreate(
            void 0,
            void 0,
            void 0,
            '',
            false,
            true,
            0,
            true,
            void 0,
            start.toDate(),
            end.toDate(),
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            void 0,
            DEFAULT_LEADERBOARD_HTML,
            DEFAULT_LEADERBOARD_CSS,
            DEFAULT_LEADERBOARD_JS,
        );
    }


    edit() {
        super.edit();

        this
            ._competitionsService.createCompetition$(this.competition)
            .finally(() => {
                this.editProcessing = false;
            })
            .subscribe({
                next: (newCompetition) => {
                    this._informationsService.success(
                        'Competition',
                        'Competition Create'
                    );

                    this._register(newCompetition.id);
                },
                error: (err) => {
                    console.error('Create Error:', err);

                    this._informationsService.error('Create Error', err.error);
                }
            })
        ;
    }


    private _register(competitionId) {
        this
            ._competitionsService
            .registerCompetition$(competitionId, void 0)
            .subscribe({
                next: () => {
                    this._router.navigate(
                        ['/competitions', competitionId],
                    );
                },
                error: (err) => {
                    console.error('Error:', err);

                    this._informationsService.error(
                        'Competition Register',
                        `Cannot register competition: ${err.message}`,
                    );
                }
            })
        ;
    }
}
