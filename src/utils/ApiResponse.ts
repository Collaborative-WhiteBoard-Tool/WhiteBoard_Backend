import {RESPONSE_CODES, ResponseCodeKey} from "../constants/responseCodes.js";

export class ApiResponse<T> {
    code: number;
    message: string;
    result?: T;

    constructor(code: number, message: string, result?: T) {
        this.code = code;
        this.message = message;
        if(result !== undefined) this.result = result;
    }

    static success<T>(key: ResponseCodeKey = "SUCCESS", result?: T) {
        const {code, message } = RESPONSE_CODES[key];
        return new ApiResponse<T>(code, message, result);
    }

    static error<T>(key: ResponseCodeKey, result?: any) {
        const {code, message } = RESPONSE_CODES[key];
        return new ApiResponse<T>(code, message, result);
    }
}