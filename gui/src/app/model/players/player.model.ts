export class Player {
    constructor(public name: string,
                public email: string,
                public picture_url: string,
                public competitions_count: number) {
    }
}



export class PlayersPaginated {
    constructor(public totalCount: number,
                public players: Player[]) {
    }
}



export class PlayerUpdate {
    constructor(public name: string,
                public picture_url: string) {
    }

    toJson() {
        return {
            name: this.name,
            picture_url: this.picture_url,
        };
    }
}
