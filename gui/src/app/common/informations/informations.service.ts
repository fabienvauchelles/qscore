declare var Notification: any;

import {Injectable} from '@angular/core';
import {ToasterService, ToasterConfig} from 'angular2-toaster/angular2-toaster';



export enum InformationType {
    SUCCESS,
    WARNING,
    ERROR
}



export class Information {
    static fromString(type: string,
                      title: string,
                      description: string): Information {
        switch (type) {
            case 'success': {
                return new Information(InformationType.SUCCESS, title, description);
            }

            case 'warning': {
                return new Information(InformationType.WARNING, title, description);
            }

            case 'error': {
                return new Information(InformationType.ERROR, title, description);
            }

            default: {
                throw new Error(`Information type unknown: ${name}`);
            }
        }
    }

    constructor(public type: InformationType,
                public title: string,
                public description: string) {
    }
}



@Injectable()
export class InformationsService {

    private _nativeEnabled = false;


    public config: ToasterConfig =
        new ToasterConfig({
            tapToDismiss: true,
            timeout: 3000,
            positionClass: 'toast-bottom-right',
        });


    constructor(private _toasterService: ToasterService,) {
        Notification.requestPermission((status) => {
            if (Notification.permission !== status) {
                Notification.permission = status;
            }

            if (Notification.permission === 'granted') {
                this._nativeEnabled = true;
            }
        });
    }


    success(title, description) {
        this._notify(new Information(InformationType.SUCCESS, title, description));
    }


    warning(title, description) {
        this._notify(new Information(InformationType.WARNING, title, description));
    }


    error(title, description) {
        this._notify(new Information(InformationType.ERROR, title, description));
    }


    private _notify(information: Information) {
        switch (information.type) {
            case InformationType.SUCCESS: {
                this._toasterService.pop('success', information.title, information.description);
                break;
            }

            case InformationType.WARNING: {
                this._toasterService.pop('warning', information.title, information.description);
                break;
            }

            case InformationType.ERROR: {
                this._toasterService.pop('error', information.title, information.description);
                break;
            }

            default: {
                throw new Error(`Information type unknown: ${information.type}`);
            }
        }

        // Display native information too if possible
        if (this._nativeEnabled) {
            const en = new Notification(information.title, {
                body: information.description,
                icon: 'assets/img/logo.png',
            });
            en.onshow = () => {
                setTimeout(en.close, 5000)
            }
        }
    }
}
