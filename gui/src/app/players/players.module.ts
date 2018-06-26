import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PaginationModule} from 'ngx-bootstrap';
import {PlayersComponent} from './players.component';

// Routing
import {PlayersRoutingModule} from './players-routing.module';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PlayersRoutingModule,
        PaginationModule.forRoot(),
    ],
    declarations: [
        PlayersComponent,
    ],
})
export class PlayersModule {
}
