export class Lead {
    constructor(public hash: string,
                public player_name: string,
                public player_picture_url: string,
                public score: number,
                public score_updated_at: Date,
                public submissions_count: number,
    ) {
    }
}



export class LeadsPaginated {
    constructor(public totalCount: number,
                public leads: Lead[]) {
    }
}
