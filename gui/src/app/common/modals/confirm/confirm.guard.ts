import {CanDeactivate} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {ModalsService} from '../modals.service';



export interface HasModification {
    isModified(): Observable<boolean> | Promise<boolean> | boolean;
}



@Injectable()
export class ConfirmGuard implements CanDeactivate<HasModification> {

    constructor(private _modalsService: ModalsService) {
    }


    canDeactivate(component: HasModification) {
        if (component.isModified()) {
            return this._modalsService.confirm$('Discard modification', 'Do you want to discard modifications ?');
        }

        return true;
    }
}
