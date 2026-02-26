// backend/services/oauth.service.ts
import { SafeUser, AuthResponse } from '../types/auth.type.js';
import { GoogleOAuthPayload } from '../types/oauth.type.js';
import { findOrCreateGoogleUser } from '../repository/oauth.repository.js';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';

/**
 * Handle Google OAuth authentication
 */
export const googleAuthService = async (
    payload: GoogleOAuthPayload
): Promise<AuthResponse> => {
    console.log('🔐 Processing Google Auth for:', payload.email);

    // Find or create user
    const user: SafeUser = await findOrCreateGoogleUser(payload);

    // Generate JWT tokens
    const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
    });

    const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
    });

    console.log('✅ Google Auth successful for user:', user.id);

    return {
        user,
        accessToken,
        refreshToken,
    };
};