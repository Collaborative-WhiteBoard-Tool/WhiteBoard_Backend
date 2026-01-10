import bcrypt from "bcrypt";
import { JwtUserPayload } from "../types/token.type.js";
import jwt from "jsonwebtoken"
import AppError from "./appError.js";
import { ENV } from "../config/env.js";

const { JsonWebTokenError, TokenExpiredError } = jwt

const SALT_ROUNDS = 10
const JWT_SECRET = ENV.JWT.JWT_SECRET!
const JWT_REFRESH_SECRET = ENV.JWT.JWT_REFRESH_SECRET!


// Hash plain password
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return bcrypt.hash(password, salt)
}

// Compare plain password with hased password 
export const comparePassword = async (password: string, hassed: string): Promise<boolean> => {
    return await bcrypt.compare(password, hassed)
}

// Generate JWT token
export const generateAccessToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' })
}

export const generateRefreshToken = (payload: object): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '24h' })
}


/**
 * Verify JWT token
 */
export const verifyAccessToken = (token: string): JwtUserPayload | undefined => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload
        if (!decoded.id || !decoded.email) {
            throw new AppError("MALFORMED_TOKEN")
        }
        return decoded
    } catch (error) {
        //Token expired
        if (error instanceof TokenExpiredError) {
            console.log('Invalid or expired token: ', error)
            throw new AppError("EXPIRED_TOKEN");
        }
        //Invalid toke ( wrong/fake token)
        if (error instanceof JsonWebTokenError) {
            throw new AppError("INVALID_TOKEN");
        }
    }
};


export const verifyRefreshToken = (token: string): JwtUserPayload => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET) as JwtUserPayload;
    } catch (error: unknown) {
        console.log('Invalid or expired token: ', error)
        throw new AppError("INVALID_TOKEN");
    }
};


