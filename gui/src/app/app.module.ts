import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {TokenInterceptor} from './common/auth/token.interceptor';
import {LoginInterceptor} from './common/auth/login.interceptor';
import {AppComponent} from './app.component';



// Import services
import {AuthService} from './common/auth/auth.service';
import {AuthGuard} from './common/auth/auth.guard';
import {AdminGuard} from './common/auth/admin.guard';
import {CompetitionsService} from './model/competitions/competitions.service';
import {SubmissionsService} from './model/submissions/submissions.service';
import {PlayersService} from './model/players/players.service';
import {EventsService} from './common/events/events.service';
import {InformationsService} from './common/informations/informations.service';
import {ModalsService} from './common/modals/modals.service';
import {MaterialsService} from './model/materials/materials.service';



// Import layouts
import {HomeLayoutComponent} from './layouts/home/home-layout.component';



// Import components
import {AppHeaderComponent} from './layouts/home/header/app-header.component';
import {SidebarComponent} from './layouts/home/sidebar/sidebar.component';
import {SidebarMinimizerComponent} from './layouts/home/sidebar/minimizer/sidebar-minimizer.component';
import {ModalsComponent} from './common/modals/modals.component';
import {ConfirmModalComponent} from './common/modals/confirm/confirm.component';

const APP_COMPONENTS = [
    AppHeaderComponent,
    SidebarComponent,
    SidebarMinimizerComponent,
    ModalsComponent,
    ConfirmModalComponent
];



// Import directives
import {NAV_DROPDOWN_DIRECTIVES} from './layouts/home/sidebar/nav-dropdown.directive';
import {SIDEBAR_TOGGLE_DIRECTIVES} from './layouts/home/sidebar/sidebar.directive';
import {ReplaceDirective} from './layouts/home/replace.directive';

const APP_DIRECTIVES = [
    NAV_DROPDOWN_DIRECTIVES,
    SIDEBAR_TOGGLE_DIRECTIVES,
    ReplaceDirective,
];



// Import routing module
import {AppRoutingModule} from './app.routing';



// Import 3rd party components
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {ChartsModule} from 'ng2-charts/ng2-charts';
import {ToasterModule} from 'angular2-toaster';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ModalModule} from 'ngx-bootstrap';
import {ConfirmGuard} from './common/modals/confirm/confirm.guard';
import {LeadsService} from './model/leads/leads.service';



@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        BsDropdownModule.forRoot(),
        TabsModule.forRoot(),
        BrowserAnimationsModule,
        ToasterModule.forRoot(),
        ModalModule.forRoot(),
        ChartsModule,
        HttpClientModule,
    ],
    declarations: [
        AppComponent,
        HomeLayoutComponent,
        ...APP_COMPONENTS,
        ...APP_DIRECTIVES
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoginInterceptor,
            multi: true,
        },
        ModalsService,
        AuthService,
        EventsService,
        AuthGuard,
        AdminGuard,
        ConfirmGuard,
        CompetitionsService,
        SubmissionsService,
        LeadsService,
        MaterialsService,
        PlayersService,
        EventsService,
        InformationsService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
