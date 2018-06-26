import {Component, Input} from '@angular/core';
import {SubmissionsService} from '../../../../model/submissions/submissions.service';
import {InformationsService} from '../../../../common/informations/informations.service';
import {ModalsService} from '../../../../common/modals/modals.service';



@Component({
    selector: 'submission-add',
    templateUrl: './submission-add.component.html',
    styleUrls: ['./submission-add.component.scss']
})
export class SubmissionAddComponent {

    @Input('token') token: string;

    datafile: File;

    comment: string;


    constructor(private _informationsService: InformationsService,
                private _modalsService: ModalsService,
                private _submissionsService: SubmissionsService) {
    }


    addWithConfirm() {
        this
            ._modalsService.confirm$(
            'Submissions',
            'Do you want to add this submission ?'
        )
            .subscribe((confirmation) => {
                if (!confirmation) {
                    return;
                }

                this._add();
            })
        ;
    }


    private _add() {
        if (!this.datafile) {
            return;
        }

        this
            ._submissionsService
            .createSubmission$(this.token, this.comment, this.datafile)
            .subscribe({
                next: () => {
                    this.datafile = void 0;

                    (<HTMLInputElement>document.getElementById('datafile')).value = '';
                    this.comment = void 0;
                },
                error: (err) => {
                    console.error('Error:', err);

                    switch (err.status) {
                        case 403: {
                            this._informationsService.error(
                                'Submissions',
                                'Submissions are not opened',
                            );

                            break;
                        }

                        case 429: {
                            const remainingTime = err.headers.get('x-rate-limit-remaining');

                            this._informationsService.warning(
                                'Submissions are too close',
                                `Next submission is only allowed in ${Math.ceil(remainingTime / 1000)} seconds.`,
                            );

                            break;
                        }

                        default: {
                            this._informationsService.error(
                                'Submission Add',
                                `Cannot add submission: ${err.message}`,
                            );

                            break;
                        }
                    }
                }
            })
        ;
    }


    dataUpload(evt) {
        if (evt.target.files &&
            evt.target.files.length > 0) {
            this.datafile = evt.target.files[0];
        } else {
            this.datafile = void 0;
        }
    }
}
