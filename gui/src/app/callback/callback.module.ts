import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../shared/shared.module';
import {PlayerCreateComponent} from './player-create.component';

// Routing
import {CallbackRoutingModule} from './callback-routing.module';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        CallbackRoutingModule,
    ],
    declarations: [
        PlayerCreateComponent,
    ],
})
export class CallbackModule {
}
