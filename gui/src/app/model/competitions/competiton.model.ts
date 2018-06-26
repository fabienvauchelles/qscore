export class CompetitionCreate {
    constructor(public title: string,
                public title_short: string,
                public scorer_class: string,
                public password: string,
                public published: boolean,
                public hidden: boolean,
                public submission_delay: number,
                public score_order: boolean,
                public picture_url: string,
                public date_start: Date,
                public date_end: Date,
                public description: string,
                public description_short: string,
                public eval_metric: string,
                public eval_format: string,
                public rules: string,
                public materials_description: string,
                public leaderboard_html: string,
                public leaderboard_css: string,
                public leaderboard_js: string) {
    }
}



export class Competition extends CompetitionCreate {

    static fromJson(rawJson): Competition {
        return new Competition(
            rawJson.id,
            rawJson.title,
            rawJson.title_short,
            rawJson.scorer_class,
            rawJson.players_count,
            rawJson.password,
            rawJson.password_needed,
            rawJson.published,
            rawJson.hidden,
            rawJson.submission_delay,
            rawJson.score_order,
            rawJson.picture_url,
            rawJson.date_start,
            rawJson.date_end,
            rawJson.description,
            rawJson.description_short,
            rawJson.eval_metric,
            rawJson.eval_format,
            rawJson.rules,
            rawJson.materials_description,
            rawJson.leaderboard_html,
            rawJson.leaderboard_css,
            rawJson.leaderboard_js,
            rawJson.token,
        );
    }

    constructor(public id: string,
                title: string,
                title_short: string,
                scorer_class: string,
                public players_count: number,
                password: string,
                public password_needed: boolean,
                published: boolean,
                hidden: boolean,
                submission_delay: number,
                score_order: boolean,
                picture_url: string,
                date_start: Date,
                date_end: Date,
                description: string,
                description_short: string,
                eval_metric: string,
                eval_format: string,
                rules: string,
                materials_description: string,
                leaderboard_html: string,
                leaderboard_css: string,
                leaderboard_js: string,
                public token: string,
    ) {
        super(
            title,
            title_short,
            scorer_class,
            password,
            published,
            hidden,
            submission_delay,
            score_order,
            picture_url,
            date_start,
            date_end,
            description,
            description_short,
            eval_metric,
            eval_format,
            rules,
            materials_description,
            leaderboard_html,
            leaderboard_css,
            leaderboard_js);
    }
}



export class CompetitionPlayer {
    constructor(public name: string,
                public email: string,
                public picture_url: string,
                public submissions_count: number) {
    }
}



export class CompetitionPlayersPaginated {
    constructor(public totalCount: number,
                public players: CompetitionPlayer[]) {
    }
}



export class CompetitionRank {
    constructor(public rank: number,
                public total: number) {
    }
}
