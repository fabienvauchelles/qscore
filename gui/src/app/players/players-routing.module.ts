import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PlayersComponent} from './players.component';



const routes: Routes = [
    {
        path: '',
        component: PlayersComponent,
    },
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PlayersRoutingModule {
}
