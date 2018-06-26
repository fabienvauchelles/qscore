export class MaterialCreate {
    constructor(public filename: string) {
    }
}



export class Material extends MaterialCreate {

    constructor(public id: string,
                filename: string
    ) {
        super(filename);
    }
}
