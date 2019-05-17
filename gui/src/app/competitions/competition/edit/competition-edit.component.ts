import * as _ from 'lodash';
import * as moment from 'moment';
import {OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CompetitionCreate} from '../../../model/competitions/competiton.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HasModification} from '../../../common/modals/confirm/confirm.guard';
import 'codemirror/mode/htmlmixed/htmlmixed';



const
    PATTERN_URL = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/,
    PATTERN_DATE = /\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}/;



function date2text(dt) {
    if (!dt) {
        return;
    }

    const mDt = moment(dt);
    if (!mDt.isValid()) {
        return;
    }

    return mDt.format('DD/MM/YYYY HH:mm')
}

function text2date(txt) {
    if (!txt || txt.length <= 0) {
        return;
    }

    const mDt = moment(txt, 'DD/MM/YYYY HH:mm');
    if (!mDt.isValid()) {
        return;
    }

    return mDt.toDate();
}



export abstract class CompetitionEditComponent implements OnInit, HasModification {

    form: FormGroup;

    codemirrorConfigHtml: object = {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'text/html',
    };

    codemirrorConfigCss: object = {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'text/css',
    };

    codemirrorConfigJs: object = {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'text/javascript',
    };

    codemirrorConfigJson: object = {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'application/json',
    };


    constructor(protected _route: ActivatedRoute,
                protected _router: Router,
                protected _formBuilder: FormBuilder,
                public modeUpdate: boolean) {
        this.form = this._formBuilder.group({
            title: [void 0, Validators.required],
            title_short: [void 0, Validators.required],
            scorer_class: [void 0, Validators.required],
            register_strategy_type: [void 0, Validators.required],
            register_strategy: [void 0, Validators.required],
            published: [void 0, Validators.required],
            hidden: [void 0, Validators.required],
            leaderboard_hidden: [void 0, Validators.required],
            submission_delay: [void 0, Validators.compose([
                Validators.required,
                Validators.min(0),
            ])],
            score_order: [void 0, Validators.required],
            picture_url: [void 0, Validators.compose([
                Validators.required,
                Validators.pattern(PATTERN_URL),
            ])],
            date_start: [void 0, Validators.compose([
                Validators.required,
                Validators.pattern(PATTERN_DATE),
            ])],
            date_end: [void 0, Validators.compose([
                Validators.required,
                Validators.pattern(PATTERN_DATE),
            ])],
            description: [void 0, Validators.required],
            description_short: [void 0, Validators.required],
            eval_metric: [void 0, Validators.required],
            eval_format: [void 0, Validators.required],
            rules: [void 0, Validators.required],
            materials_description: [void 0, Validators.required],
            leaderboard_html: [void 0],
            leaderboard_css: [void 0],
            leaderboard_js: [void 0],
        });
    }


    get title() {
        return this.form.get('title');
    }

    get title_short() {
        return this.form.get('title_short');
    }

    get scorer_class() {
        return this.form.get('scorer_class');
    }

    get register_strategy_type() {
        return this.form.get('register_strategy_type');
    }

    get register_strategy() {
        return this.form.get('register_strategy');
    }

    get published() {
        return this.form.get('published');
    }

    get hidden() {
        return this.form.get('hidden');
    }

    get leaderboard_hidden() {
        return this.form.get('leaderboard_hidden');
    }

    get submission_delay() {
        return this.form.get('submission_delay');
    }

    get score_order() {
        return this.form.get('score_order');
    }

    get picture_url() {
        return this.form.get('picture_url');
    }

    get date_start() {
        return this.form.get('date_start');
    }

    get date_end() {
        return this.form.get('date_end');
    }

    get description() {
        return this.form.get('description');
    }

    get description_short() {
        return this.form.get('description_short');
    }

    get eval_metric() {
        return this.form.get('eval_metric');
    }

    get eval_format() {
        return this.form.get('eval_format');
    }

    get rules() {
        return this.form.get('rules');
    }

    get materials_description() {
        return this.form.get('materials_description');
    }

    get leaderboard_html() {
        return this.form.get('leaderboard_html');
    }

    get leaderboard_css() {
        return this.form.get('leaderboard_css');
    }

    get leaderboard_js() {
        return this.form.get('leaderboard_js');
    }


    get competition(): CompetitionCreate {
        const c = _.omit(this.form.value, ['date_start', 'date_end', 'register_strategy']);

        c.date_start = text2date(this.form.value.date_start);
        c.date_end = text2date(this.form.value.date_end);

        try {
            c.register_strategy = JSON.parse(this.form.value.register_strategy);
        }
        catch (err) {
            c.register_strategy = void 0;
        }

        return c;
    }

    set competition(newCompetition: CompetitionCreate) {
        this.form.patchValue({
            title: newCompetition.title,
            title_short: newCompetition.title_short,
            scorer_class: newCompetition.scorer_class,
            register_strategy_type: newCompetition.register_strategy_type,
            register_strategy: JSON.stringify(newCompetition.register_strategy),
            hidden: newCompetition.hidden,
            leaderboard_hidden: newCompetition.leaderboard_hidden,
            published: newCompetition.published,
            submission_delay: newCompetition.submission_delay,
            score_order: newCompetition.score_order,
            picture_url: newCompetition.picture_url,
            date_start: date2text(newCompetition.date_start),
            date_end: date2text(newCompetition.date_end),
            description: newCompetition.description,
            description_short: newCompetition.description_short,
            eval_metric: newCompetition.eval_metric,
            eval_format: newCompetition.eval_format,
            rules: newCompetition.rules,
            materials_description: newCompetition.materials_description,
            leaderboard_html: newCompetition.leaderboard_html,
            leaderboard_css: newCompetition.leaderboard_css,
            leaderboard_js: newCompetition.leaderboard_js,
        });
    }


    ngOnInit() {}


    editProcessing: boolean = false;

    edit() {
        this.editProcessing = true;
    }


    isModified(): boolean {
        return !this.form.pristine;
    }
}
