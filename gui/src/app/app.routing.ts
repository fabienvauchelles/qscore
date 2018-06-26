import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './common/auth/auth.guard';
import {HomeLayoutComponent} from './layouts/home/home-layout.component';
import {CallbackComponent} from './callback/callback.component';
import {AdminGuard} from './common/auth/admin.guard';



export const routes: Routes = [
    {
        // Default
        path: '',
        redirectTo: 'competitions',
        pathMatch: 'full',
    },

    {
        path: '',
        component: HomeLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'competitions',
                loadChildren: './competitions/competitions.module#CompetitionsModule',
            },

            {
                path: 'players',
                canActivate: [AdminGuard],
                loadChildren: './players/players.module#PlayersModule',
            },
        ],
    },

    {
        path: 'leaderboards',
        loadChildren: './leaderboard-container/leaderboard-container.module#LeaderboardContainerModule',
    },

    {
        path: 'callback',
        component: CallbackComponent,
    },
];



@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
