import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PlayerCreateComponent} from "./player-create.component";



const routes: Routes = [
    {
        path: '',
        component: PlayerCreateComponent,
    },
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CallbackRoutingModule {
}
