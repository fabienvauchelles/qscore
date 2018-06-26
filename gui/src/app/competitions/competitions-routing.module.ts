import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {InternalLeaderboardComponent} from './competition/internal-leaderboard/internal-leaderboard.component';
import {CompetitionsComponent} from './competitions.component';
import {InfoComponent} from './competition/info/info.component';
import {EvaluationComponent} from './competition/evaluation/evaluation.component';
import {CompetitionComponent} from './competition/competition.component';
import {SubmissionsComponent} from './competition/submissions/submissions.component';
import {RulesComponent} from './competition/rules/rules.component';
import {MaterialsComponent} from './competition/materials/materials.component';
import {CompetitionJoinComponent} from './competition-join/competition-join.component';
import {CompetitionCreateComponent} from './competition/edit/competition-create.component';
import {CompetitionUpdateComponent} from './competition/edit/competition-update.component';
import {ConfirmGuard} from '../common/modals/confirm/confirm.guard';
import {AdminGuard} from '../common/auth/admin.guard';
import {CompetitionPlayersComponent} from './competition/players/competition-players.component';



const routes: Routes = [
    {
        path: '',
        component: CompetitionsComponent,
    },
    {
        path: 'create',
        component: CompetitionCreateComponent,
    },
    {
        path: ':competitionId',
        component: CompetitionComponent,
        children: [
            {
                // Default
                path: '',
                redirectTo: 'info',
                pathMatch: 'full',
            },
            {
                path: 'update',
                component: CompetitionUpdateComponent,
                canActivate: [AdminGuard],
                canDeactivate: [ConfirmGuard],
            },
            {
                path: 'info',
                component: InfoComponent,
            },
            {
                path: 'evaluation',
                component: EvaluationComponent,
            },
            {
                path: 'rules',
                component: RulesComponent,
            },
            {
                path: 'materials',
                component: MaterialsComponent,
            },
            {
                path: 'submissions',
                component: SubmissionsComponent,
            },
            {
                path: 'leaderboard',
                component: InternalLeaderboardComponent,
            },
            {
                path: 'players',
                component: CompetitionPlayersComponent,
                canActivate: [AdminGuard],
            }
        ]
    },
    {
        path: 'join/:competitionId',
        component: CompetitionJoinComponent,
    },
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CompetitionsRoutingModule {
}
