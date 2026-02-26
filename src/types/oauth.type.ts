import { SafeUser } from './auth.type.js';

export interface GoogleProfile {
    id: string;
    displayName: string;
    emails?: Array<{ value: string; verified: boolean }>;
    photos?: Array<{ value: string }>;
    provider: 'google';
    _json: {
        sub: string;
        name: string;
        given_name: string;
        family_name: string;
        picture: string;
        email: string;
        email_verified: boolean;
        locale: string;
    };
}

export interface GoogleOAuthPayload {
    googleId: string;
    email: string;
    displayName: string;
    avatar?: string;
    emailVerified: boolean;
}

export interface OAuthUser extends SafeUser {
    googleId: string | null;
    provider: string;
}

export type OAuthProvider = 'google' | 'local';

export interface CreateOAuthUserDTO {
    googleId: string;
    email: string;
    displayName: string;
    avatar?: string;
    provider: OAuthProvider;
}