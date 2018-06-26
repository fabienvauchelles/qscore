import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {LeaderboardComponent} from './leaderboard/leaderboard.component';
import {LeaderboardContainerComponent} from './leaderboard-container.component';

// Routing
import {LeaderboardContainerRoutingModule} from './leaderboard-container-routing.module';



@NgModule({
    imports: [
        CommonModule,
        LeaderboardContainerRoutingModule,
        SharedModule,
    ],
    declarations: [
        LeaderboardContainerComponent,
        LeaderboardComponent,
    ],
})
export class LeaderboardContainerModule {
}
