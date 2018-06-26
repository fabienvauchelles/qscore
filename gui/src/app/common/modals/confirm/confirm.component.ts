import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Component, ViewChild, OnInit} from '@angular/core';
import {ModalsService} from '../modals.service';
import {ModalDirective} from 'ngx-bootstrap/modal';



@Component({
    selector: 'modal-confirm',
    templateUrl: './confirm.component.html',
})
export class ConfirmModalComponent implements OnInit {

    @ViewChild('modal') public modal: ModalDirective;
    title: string;
    description: string;

    private _confirmationSource: Subject<boolean>;


    constructor(private _modalsService: ModalsService) {
    }


    ngOnInit() {
        this._modalsService.registerConfirm(this);
    }


    show$(title: string, description: string): Observable<boolean> {
        // Change modal content
        this.title = title;
        this.description = description;

        // Prepare return value
        this._confirmationSource = new Subject<boolean>();
        const confirmation$ = this._confirmationSource.asObservable();

        // Show modal
        this.modal.show();

        return confirmation$;
    }


    yes() {
        this._confirmationSource.next(true);
        this.modal.hide();
    }


    no() {
        this._confirmationSource.next(false);
        this.modal.hide();
    }
}
