import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {ConfirmModalComponent} from './confirm/confirm.component';



@Injectable()
export class ModalsService {

    private _confirmComponent: ConfirmModalComponent;


    constructor() {
    }


    registerConfirm(component: ConfirmModalComponent) {
        this._confirmComponent = component;
    }


    confirm$(title: string, description: string): Observable<boolean> {
        return this._confirmComponent.show$(title, description);
    }
}



export function Confirm(options) {
    if (!options.title || !options.text) {
        throw new Error('Missing title or description for confirmation');
    }

    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        const originalMethod = descriptor.value;

        const injector = window['rootInjector'];
        const modalsService = injector.get(ModalsService);

        descriptor.value = function (...args: any[]) {
            let title;
            if (options.title instanceof Function) {
                title = options.title.apply(this);
            }
            else {
                title = options.title;
            }

            let text;
            if (options.text instanceof Function) {
                text = options.text.apply(this);
            }
            else {
                text = options.text;
            }

            modalsService
                .confirm$(title, text)
                .subscribe((confirmation) => {
                    if (!confirmation) {
                        return;
                    }

                    originalMethod.apply(this, args);
                })
            ;
        };

        return descriptor;
    }
}
