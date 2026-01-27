import { ResponseCodeKey } from "../constants/responseCodes.js";

class AppError extends Error {
    public key: ResponseCodeKey;
    public isOperational: boolean
    public errors?: { field: string, message: string }[];

    constructor(key: ResponseCodeKey, errors?: { field: string, message: string }[]) {
        super(key);
        this.key = key;
        this.isOperational = true
        this.errors = errors
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;