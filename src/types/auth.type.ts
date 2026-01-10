import { User } from "../../generated/prisma/client.js";
import { Request } from "express";
export type SafeUser = Omit<User, "password">;

export interface AuthResponse {
    user: SafeUser,
    accessToken: string;
    refreshToken: string;
}

export interface AuthRequest extends Request {
    userId?: string;
    email?: string;
}
