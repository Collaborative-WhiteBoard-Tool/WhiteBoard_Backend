// backend/config/passport.config.ts
import passport from 'passport';
import {
    Strategy as GoogleStrategy,
    Profile,
    VerifyCallback,
} from 'passport-google-oauth20';
import { findOrCreateGoogleUser } from '../repository/oauth.repository.js';
import { GoogleOAuthPayload } from '../types/oauth.type.js';
import AppError from '../utils/appError.js';
import { ENV } from './env.js';

/**
 * Configure Google OAuth Strategy
 */
export const configurePassport = (): void => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: ENV.GOOGLE.GOOGLE_CLIENT_ID!,
                clientSecret: ENV.GOOGLE.GOOGLE_CLIENT_SECRET!,
                callbackURL: ENV.GOOGLE.GOOGLE_CALLBACK_URL!,
                passReqToCallback: false,
            },
            async (
                accessToken: string,
                refreshToken: string,
                profile: Profile,
                done: VerifyCallback
            ): Promise<void> => {
                try {
                    console.log('📧 Google OAuth Profile received:', {
                        id: profile.id,
                        email: profile.emails?.[0]?.value,
                        name: profile.displayName,
                        verified: profile.emails?.[0]?.verified,
                    });

                    // Validate required fields
                    const email = profile.emails?.[0]?.value;
                    if (!email) {
                        return done(new AppError('OAUTH_NO_EMAIL'));
                    }

                    const emailVerified = profile.emails?.[0]?.verified ?? false;
                    if (!emailVerified) {
                        return done(new AppError('OAUTH_EMAIL_NOT_VERIFIED'));
                    }

                    // Map Google profile to our payload
                    const googlePayload: GoogleOAuthPayload = {
                        googleId: profile.id,
                        email,
                        displayName: profile.displayName,
                        avatar: profile.photos?.[0]?.value,
                        emailVerified,
                    };

                    // Find or create user
                    const user = await findOrCreateGoogleUser(googlePayload);

                    console.log('✅ User authenticated:', user.id);
                    return done(null, user);
                } catch (error) {
                    console.error('❌ Google OAuth error:', error);
                    if (error instanceof AppError) {
                        return done(error);
                    }
                    return done(new AppError('GOOGLE_AUTH_FAILED'));
                }
            }
        )
    );

    // Serialize/deserialize (not used for JWT but required by Passport)
    passport.serializeUser((user: Express.User, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id: string, done) => {
        done(null, { id } as Express.User);
    });
};

export default passport;