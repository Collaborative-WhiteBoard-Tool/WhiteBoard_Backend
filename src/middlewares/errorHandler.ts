import { Request, Response } from 'express';
import AppError from '../utils/appError.js';
import { RESPONSE_CODES } from '../constants/responseCodes.js';


const errorHandler = (
    err: AppError,
    req: Request,
    res: Response
) => {
    //Lỗi ko kiểm soát
    //Server Error
    if (!err.isOperational) {
        console.log('Operational ERROR 💥', err);
        return res.status(RESPONSE_CODES.INTERNAL_ERROR.httpStatus).json({
            status: "error",
            code: RESPONSE_CODES.INTERNAL_ERROR.code,
            message: RESPONSE_CODES.INTERNAL_ERROR.message,
        })
    }

    // Lỗi nghiệp vụ / client
    //Operational Error (client Error)
    const { httpStatus, code, message } = RESPONSE_CODES[err.key]
    res.status(httpStatus).json({
        status: "fail",
        code,
        message,
        errors: err.errors
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export default errorHandler;
