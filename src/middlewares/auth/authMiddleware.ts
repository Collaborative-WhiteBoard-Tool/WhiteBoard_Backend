import { NextFunction, Request, Response } from "express";
import AppError from "../../utils/appError.js";
import { verifyAccessToken } from "../../utils/auth.js";

export const protect = (req: Request, res: Response, next: NextFunction) => {
    const headerAuth = req.headers.authorization
    if (!headerAuth || !headerAuth.startsWith("Bearer")) {
        return next(new AppError("UNAUTHORIZED"))
    }
    const token = headerAuth.split(" ")[1]
    try {
        const decoded = verifyAccessToken(token)
        req.user = decoded
        next()
    } catch (error) {
        console.log('error token: ', error)
        return next(new AppError("INVALID_TOKEN"))
    }

}