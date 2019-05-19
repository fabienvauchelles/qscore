import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PaginationModule, TabsModule} from 'ngx-bootstrap';
import {SharedModule} from '../shared/shared.module';
import {CompetitionsComponent} from './competitions.component';
import {CompetitionComponent} from './competition/competition.component';
import {CompetitionJoinComponent} from './competition-join/competition-join.component';
import {CompetitionViewComponent} from './view/view.component';
import {CompetitionCreateComponent} from './competition/edit/competition-create.component';
import {CompetitionUpdateComponent} from './competition/edit/competition-update.component';
import {SubmissionsComponent} from './competition/submissions/submissions.component';
import {NotebookExampleComponent} from './competition/submissions/notebook-example/notebook-example.component';
import {SubmissionAddComponent} from './competition/submissions/submission-add/submission-add.component';
import {InternalLeaderboardComponent} from './competition/internal-leaderboard/internal-leaderboard.component';
import {InfoComponent} from './competition/info/info.component';
import {EvaluationComponent} from './competition/evaluation/evaluation.component';
import {RulesComponent} from './competition/rules/rules.component';
import {MaterialsComponent} from './competition/materials/materials.component';
import {CompetitionPlayersComponent} from './competition/players/competition-players.component';
import {MaterialUpdateComponent} from "./competition/edit/material/material-update.component";

// Routing
import {CompetitionsRoutingModule} from './competitions-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        CompetitionsRoutingModule,
        PaginationModule.forRoot(),
        TabsModule.forRoot(),
    ],
    declarations: [
        CompetitionsComponent,
        CompetitionViewComponent,
        CompetitionComponent,
        CompetitionJoinComponent,
        CompetitionCreateComponent,
        CompetitionUpdateComponent,
        InfoComponent,
        EvaluationComponent,
        RulesComponent,
        MaterialsComponent,
        SubmissionsComponent,
        NotebookExampleComponent,
        SubmissionAddComponent,
        InternalLeaderboardComponent,
        CompetitionPlayersComponent,
        MaterialUpdateComponent,
    ],
})
export class CompetitionsModule {
}
