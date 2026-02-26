// backend/routes/oauth.routes.ts
import { Router } from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/oauthController.js';
import { ENV } from '../config/env.js';

const router = Router();

/**
 * GET /api/oauth/google
 * Initiates Google OAuth flow
 */
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        prompt: 'select_account'
    })
);

/**
 * GET /api/oauth/google/callback
 * Google OAuth callback
 */
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${ENV.FRONTEND_URL}/login?error=GOOGLE_AUTH_FAILED`,
    }),
    googleCallback
);

export default router;