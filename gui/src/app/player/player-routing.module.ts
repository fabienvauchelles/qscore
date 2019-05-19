import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PlayerUpdateComponent} from "./player-update.component";
import {ConfirmGuard} from "../common/modals/confirm/confirm.guard";



const routes: Routes = [
    {
        path: '',
        component: PlayerUpdateComponent,
        canDeactivate: [ConfirmGuard],
    },
];



@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PlayerRoutingModule {
}
