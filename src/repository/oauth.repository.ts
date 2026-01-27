// backend/repository/oauth.repository.ts
import prisma from '../config/prisma.js';
import { SafeUser } from '../types/auth.type.js';
import { CreateOAuthUserDTO, GoogleOAuthPayload } from '../types/oauth.type.js';
import AppError from '../utils/appError.js';

/**
 * Find user by Google ID
 */
export const findUserByGoogleId = async (
    googleId: string
): Promise<SafeUser | null> => {
    const user = await prisma.user.findUnique({
        where: { googleId },
    });

    if (!user) return null;

    const { password: _pw, ...safeUser } = user;
    return safeUser;
};

/**
 * Find user by email
 */
export const findUserByEmail = async (
    email: string
): Promise<SafeUser | null> => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) return null;

    const { password: _pw, ...safeUser } = user;
    return safeUser;
};

/**
 * Generate unique username from email
 */
const generateUniqueUsername = async (email: string): Promise<string> => {
    const baseUsername = email.split('@')[0].toLowerCase();
    let username = baseUsername;
    let counter = 1;

    // eslint-disable-next-line no-await-in-loop
    while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter += 1;
    }

    return username;
};

/**
 * Create new OAuth user
 */
export const createOAuthUser = async (
    payload: CreateOAuthUserDTO
): Promise<SafeUser> => {
    const username = await generateUniqueUsername(payload.email);

    const user = await prisma.user.create({
        data: {
            googleId: payload.googleId,
            email: payload.email,
            username,
            displayName: payload.displayName,
            avatar: payload.avatar,
            provider: payload.provider,
            emailVerified: true,
            password: null,
        },
    });

    const { password: _pw, ...safeUser } = user;
    console.log('✅ Created new OAuth user:', safeUser.id);
    return safeUser;
};

/**
 * Link Google account to existing user
 */
export const linkGoogleAccount = async (
    userId: string,
    googleId: string,
    avatar?: string
): Promise<SafeUser> => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            googleId,
            provider: 'google',
            emailVerified: true,
            avatar: avatar || undefined,
        },
    });

    const { password: _pw, ...safeUser } = user;
    console.log('🔗 Linked Google account to existing user:', safeUser.id);
    return safeUser;
};

/**
 * Find or create user from Google OAuth
 */
export const findOrCreateGoogleUser = async (
    payload: GoogleOAuthPayload
): Promise<SafeUser> => {
    // 1. Try to find by Google ID
    let user = await findUserByGoogleId(payload.googleId);

    if (user) {
        console.log('✅ Found existing user by Google ID:', user.id);
        return user;
    }

    // 2. Try to find by email (user might have registered with email/password)
    user = await findUserByEmail(payload.email);

    if (user) {
        // Check if already linked to another Google account
        if (user.googleId && user.googleId !== payload.googleId) {
            throw new AppError('EMAIL_EXISTS', [
                {
                    field: 'email',
                    message: 'This email is already linked to another Google account',
                },
            ]);
        }

        // Link Google account to existing user
        return await linkGoogleAccount(
            user.id,
            payload.googleId,
            payload.avatar
        );
    }

    // 3. Create new user
    console.log('➕ Creating new Google user');
    return await createOAuthUser({
        googleId: payload.googleId,
        email: payload.email,
        displayName: payload.displayName,
        avatar: payload.avatar,
        provider: 'google',
    });
};