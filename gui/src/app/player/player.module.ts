import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {PlayerUpdateComponent} from './player-update.component';

// Routing
import {PlayerRoutingModule} from './player-routing.module';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        PlayerRoutingModule,
    ],
    declarations: [
        PlayerUpdateComponent,
    ],
})
export class PlayerModule {
}
