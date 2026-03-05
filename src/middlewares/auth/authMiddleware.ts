import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError.js";
import { verifyAccessToken } from "../../utils/auth.js";

export const protect = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken
        || req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
        return next(new AppError('UNAUTHORIZED'));
    }

    try {
        const decoded = verifyAccessToken(accessToken);
        if (!decoded) {
            return next(new AppError('INVALID_TOKEN'));
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Invalid access token:', error);
        return next(new AppError('INVALID_TOKEN'));
    }
}