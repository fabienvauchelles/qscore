export class SubmissionCreate {
    constructor(public comment: string) {
    }
}



export class Submission extends SubmissionCreate {

    static fromJson(rawJson): Submission {
        return new Submission(
            rawJson.id,
            rawJson.status,
            rawJson.score,
            rawJson.comment,
            rawJson.error,
            rawJson.update_at ? new Date(rawJson.update_at) : void 0,
        );
    }


    constructor(public id: string,
                public status: string,
                public score: number,
                comment: string,
                public error: string,
                public updated_at: Date
    ) {
        super(comment);
    }
}



export class SubmissionsPaginated {
    constructor(public totalCount: number,
                public submissions: Submission[]) {
    }
}
