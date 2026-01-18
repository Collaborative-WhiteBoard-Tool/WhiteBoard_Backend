import { NextFunction, Request, Response } from "express"
import { createUserSchema, loginSchema } from "../schemas/userSchema.js";
import { findUserById, loginService, registerService } from "../services/auth.service.js";
import AppError from "../utils/appError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { JwtPayload } from "jsonwebtoken";




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
        res.cookie('accessToken', result.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.status(200).json(ApiResponse.success("SUCCESS", result))
    } catch (error) {
        next(error)
    }
}

export const logout = (req: Request, res: Response) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    console.log("Cookies cleared: ", res.cookie);
    res.json({ status: 'success' });
};


export const getMe = async (req: JwtPayload, res: Response, next: NextFunction) => {
    console.log("Get Me userId: ", req.user.id);
    const userId = req.user!.id;


    const user = await findUserById(userId);

    if (!user) {
        return next(new AppError('NOT_FOUND'));
    }

    return res.json(ApiResponse.success("SUCCESS", user));
}

