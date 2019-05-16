import 'rxjs/add/operator/debounceTime';
import {Subscription} from 'rxjs/Subscription';
import 'codemirror/mode/python/python';
import 'codemirror/mode/r/r';
import {Component, Input, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {FormControl} from '@angular/forms';
import {InformationsService} from '../../../../common/informations/informations.service';



@Component({
    selector: 'notebook-example',
    templateUrl: './notebook-example.component.html',
    styleUrls: ['./notebook-example.component.scss']
})
export class NotebookExampleComponent implements OnInit, OnDestroy {

    @ViewChild('cm1') cm1;
    @ViewChild('cm2') cm2;

    languageControl = new FormControl();
    languageControlSub: Subscription;

    private _token: string;
    private _language: string;

    code1: string;
    code2: string;

    config: any = {
        lineNumbers: true,
        mode: 'text/x-python',
        readOnly: true
    };


    @Input('token')
    get token(): string {
        return this._token;
    }

    set token(v: string) {
        this._token = v;

        this._updateCode();
    }


    constructor(private _informationsService: InformationsService) {
    }


    ngOnInit() {
        this.languageControlSub = this.languageControl.valueChanges
            .subscribe((newValue) => {
                this._language = newValue;

                this._updateCode();
            });

        this.languageControl.patchValue('python3');
    }


    ngOnDestroy() {
        this.languageControlSub.unsubscribe();
    }


    refresh() {
        this.cm1.refresh();
        this.cm2.refresh();
    }


    copyToken() {
        const copyText = <HTMLSelectElement>document.getElementById('token');
        copyText.select();
        document.execCommand('Copy');

        this._informationsService.success(
            'Token',
            'Token is copied to the clipboard'
        );
    }


    private _updateCode() {
        // Get URL origin
        const l = document.createElement('a');
        l.href = window.location.href;
        const origin = `${l.protocol}//${l.host}`;

        switch (this._language) {
            case 'python3': {
                this.config.mode = 'text/x-python';

                this.code1 = `import io, math, requests

def submit_prediction(df, sep=',', comment='', **kwargs):
    TOKEN='${this._token}'
    URL='${origin}/api/submissions'
    buffer = io.StringIO()
    df.to_csv(buffer, sep=sep, **kwargs)
    buffer.seek(0)
    r = requests.post(URL, headers={'Authorization': 'Bearer {}'.format(TOKEN)},files={'datafile': buffer},data={'comment':comment})
    if r.status_code == 429:
        raise Exception('Submissions are too close. Next submission is only allowed in {} seconds.'.format(int(math.ceil(int(r.headers['x-rate-limit-remaining']) / 1000.0))))
    if r.status_code != 200:
        raise Exception(r.text)`;

                this.code2 = 'submit_prediction(df_submission, sep=\',\', index=True, comment=\'my submission\')';

                break;
            }

            case 'python2': {
                this.config.mode = 'text/x-python';

                this.code1 = `import io, math, requests

def submit_prediction(df, sep=',', comment='', **kwargs):
    TOKEN='${this._token}'
    URL='${origin}/api/submissions'
    buffer = io.BytesIO()
    df.to_csv(buffer, sep=sep, **kwargs)
    buffer.seek(0)
    r = requests.post(URL, headers={'Authorization': 'Bearer {}'.format(TOKEN)},files={'datafile': buffer},data={'comment':comment})
    if r.status_code == 429:
        raise Exception('Submissions are too close. Next submission is only allowed in {} seconds.'.format(int(math.ceil(int(r.headers['x-rate-limit-remaining']) / 1000.0))))
    if r.status_code != 200:
        raise Exception(r.text)`;

                this.code2 = 'submit_prediction(df_submission, sep=\',\', index=True, comment=\'my submission\')';

                break;
            }

            case 'r': {
                this.config.mode = 'text/x-rsrc';

                this.code1 = `
library(httr)
submit_prediction <- function(predictions, comment) {
    # write the dataset with predictions on your current directory
    token <- '${this._token}'
    url <- '${origin}/api/submissions'

    f <- write.csv(predictions, file = 'predictions.csv', row.names = F)
    response <- POST(url = url,
                     add_headers(Authorization = paste0('Bearer ', token)),
                     body = list(datafile = upload_file('predictions.csv'),
                                 comment = comment)
                     )

    if (response$status_code == 429) {
        stop(sprintf('Submissions are too close. Next submission is only allowed in %s seconds.',
                     ceiling(strtoi(response$headers$'x-rate-limit-remaining') / 1000.0)
                     )
        )
    }
    else if (response$status_code != 200) {
        stop(content(response, type = 'text'))
    }
}`;

                this.code2 = 'submit_prediction(predictions, \'my submission\')';

                break;
            }
        }
    }
}
