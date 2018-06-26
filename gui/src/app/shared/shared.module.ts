import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProcessingDirective} from './processing/processing.directive';
import {CodemirrorComponent} from './codemirror/codemirror.component';



@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        ProcessingDirective,
        CodemirrorComponent,
    ],
    exports: [
        ProcessingDirective,
        CodemirrorComponent,
    ]
})
export class SharedModule {
}
