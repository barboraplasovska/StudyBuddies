import {ErrorEnum} from "../enumerations/ErrorEnum";

export class HttpError extends Error {
    public readonly code: ErrorEnum;

    constructor(code: ErrorEnum, message?: string) {
        super(message);
        this.code = code;
    }
}