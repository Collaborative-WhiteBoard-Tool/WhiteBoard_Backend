import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError.js";
import { verifyAccessToken } from "../../utils/auth.js";



export const protect = (req: Request, res: Response, next: NextFunction) => {
    // cookie-parser phải được dùng trước middleware này
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
        return next(new AppError('UNAUTHORIZED'));
    }

    try {
        const decoded = verifyAccessToken(accessToken);
        req.user = decoded; // userId, role, ...
        next();
    } catch (error) {
        console.log('Invalid access token:', error);
        return next(new AppError('INVALID_TOKEN',));
    }

}