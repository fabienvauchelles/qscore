import * as moment from 'moment';


export const PATTERN_URL = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
export const PATTERN_DATE = /\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}/;


export function date2text(dt) {
    if (!dt) {
        return;
    }

    const mDt = moment(dt);
    if (!mDt.isValid()) {
        return;
    }

    return mDt.format('DD/MM/YYYY HH:mm')
}


export function text2date(txt) {
    if (!txt || txt.length <= 0) {
        return;
    }

    const mDt = moment(txt, 'DD/MM/YYYY HH:mm');
    if (!mDt.isValid()) {
        return;
    }

    return mDt.toDate();
}
