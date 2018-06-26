import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Competition} from '../../model/competitions/competiton.model';



@Component({
    selector: 'competition-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.scss'],
})
export class CompetitionViewComponent {

    @Input('value') competition: Competition;
    @Output() onView = new EventEmitter<void>();


    constructor() {
    }


    view() {
        this.onView.emit();
    }
}
