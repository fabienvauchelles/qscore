export class Lead {
    constructor(public hash: string,
                public player_name: string,
                public player_picture_url: string,
                public player_location: string,
                public score: number,
                public score_updated_at: Date,
                public submissions_count: number,
    ) {
    }
}



export class LeadsPaginated {
    constructor(public total_count: number,
                public register_strategy_type: number,
                public leads: Lead[],
                public best_locations_leads: Lead[]) {
    }
}
