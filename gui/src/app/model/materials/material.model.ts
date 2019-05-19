export class MaterialCreate {
    constructor(public filename: string,
                public release_at: Object,
                public description: string) {
    }
}



export class Material extends MaterialCreate {

    constructor(public id: string,
                filename: string,
                release_at: Object,
                description: string,
    ) {
        super(filename, release_at, description);
    }
}
