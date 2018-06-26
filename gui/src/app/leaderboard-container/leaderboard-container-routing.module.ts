import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LeaderboardContainerComponent} from './leaderboard-container.component';



const routes: Routes = [
    {
        // Default
        path: '',
        redirectTo: '..',
        pathMatch: 'full',
    },
    {
        path: ':competitionId',
        component: LeaderboardContainerComponent,
    }
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LeaderboardContainerRoutingModule{
}
