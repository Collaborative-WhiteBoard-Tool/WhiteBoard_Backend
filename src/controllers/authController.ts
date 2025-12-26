import { NextFunction, Request, Response } from "express"
import { createUserSchema, loginSchema } from "../schemas/userSchema.js";
import { loginService, registerService } from "../services/auth.service.js";
import { HttpStatusCode } from "../constants/HttpStatusCode.js";
import { RESPONSE_CODES } from "../constants/responseCodes.js";
import AppError from "../utils/appError.js";
import { ApiResponse } from "../utils/apiResponse.js";




export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userdata = createUserSchema.parse(req.validated?.body)
        const user = await registerService(userdata)
        // res.status(HttpStatusCode.CREATED).json({
        //     code: RESPONSE_CODES.CREATED.code,
        //     message: RESPONSE_CODES.CREATED.message,
        //     user
        // })
        res.status(201).json(ApiResponse.success("SUCCESS", user));

    } catch (error) {
        next(error)
    }
}


export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userdata = loginSchema.parse(req.validated?.body)
        const result = await loginService(userdata)
        return res.status(200).json(ApiResponse.success("SUCCESS", result))
    } catch (error) {
        next(error)
    }
}
