import { NextFunction, Request, Response } from "express"
import { createUserSchema, loginSchema } from "../schemas/userSchema.js";
import { findUserById, loginService, refreshSessionService, registerService } from "../services/auth.service.js";
import AppError from "../utils/appError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { JwtPayload } from "jsonwebtoken";




export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userdata = createUserSchema.parse(req.validated?.body)
        const result = await registerService(userdata)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none' as const,
        };
        res.cookie('accessToken', result.accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.cookie('refreshToken', result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json(ApiResponse.success("SUCCESS", result));

    } catch (error) {
        next(error)
    }
}


export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userdata = loginSchema.parse(req.validated?.body)
        const result = await loginService(userdata)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none' as const,
        };
        res.cookie('accessToken', result.accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.cookie('refreshToken', result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        return res.status(200).json(ApiResponse.success("SUCCESS", result))
    } catch (error) {
        next(error)
    }
}

export const logout = (req: Request, res: Response) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none' as const,
    };

    // Xóa cookies bằng cách set lại với giá trị rỗng và thời gian hết hạn ngay lập tức
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    console.log("Logout: Cookies have been cleared");

    return res.status(200).json(ApiResponse.success("SUCCESS"));
};


export const getMe = async (req: JwtPayload, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.id) {
            throw new AppError('USER_NOT_FOUND');
        }

        console.log("Get Me userId:", req.user.id);
        const user = await findUserById(req.user.id);

        if (!user) {
            throw new AppError('NOT_FOUND');
        }

        return res.json(ApiResponse.success("SUCCESS", user));
    } catch (error) {
        next(error)
    }
}


export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken || req.body?.refreshToken as string | undefined;

        if (!oldRefreshToken) {
            return next(new AppError('REFRESH_TOKEN_NOT_FOUND'));
        }

        // Gọi Service xử lý logic
        const { accessToken, refreshToken, userId } = await refreshSessionService(oldRefreshToken);

        // Thiết lập Cookie
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none' as const,
        };

        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000 // 1 ngày
        });

        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        return res.status(200).json(
            ApiResponse.success("TOKEN_REFRESHED", { userId })
        );
    } catch (error) {
        // Nếu lỗi, xóa sạch cookies cũ để ép user login lại
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        next(error);
    }
};