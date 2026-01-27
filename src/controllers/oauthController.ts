// backend/controllers/oauth.controller.ts
import { NextFunction, Request, Response } from 'express';
import { googleAuthService } from '../services/oauth.service.js';
import { SafeUser } from '../types/auth.type.js';
import AppError from '../utils/appError.js';
import { ENV } from '../config/env.js';

/**
 * Google OAuth callback handler
 */
export const googleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // User is attached by Passport middleware
        const user = req.user as SafeUser | undefined;

        if (!user || !user.googleId) {
            throw new AppError('GOOGLE_AUTH_FAILED');
        }

        console.log('📧 Google callback received for user:', user.email);

        // Generate tokens
        const result = await googleAuthService({
            googleId: user.googleId,
            email: user.email,
            displayName: user.displayName ?? user.username ?? "",
            avatar: user.avatar || undefined,
            emailVerified: user.emailVerified,
        });

        // Set HTTP-only cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
        };

        res.cookie('accessToken', result.accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.cookie('refreshToken', result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        console.log('✅ Google auth successful, redirecting to frontend');

        // Redirect to frontend success page
        const frontendUrl = ENV.FRONTEND_URL;
        res.redirect(`${frontendUrl}/auth/google/success`);
    } catch (error) {
        console.error('❌ Google callback error:', error);

        // Redirect to frontend with error
        const frontendUrl = ENV.FRONTEND_URL;
        const errorMessage =
            error instanceof AppError
                ? error.key
                : 'GOOGLE_AUTH_FAILED';
        res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
        next(error)
    }
};

/**
 * Initiate Google OAuth flow (handled by Passport)
 */
export const googleLogin = (): void => {
    // This is handled by Passport middleware
    // Keeping this for type consistency
};