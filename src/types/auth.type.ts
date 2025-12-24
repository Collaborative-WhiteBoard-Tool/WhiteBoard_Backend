import { User } from "../../generated/prisma/client.js";

export type SafeUser = Omit<User, "password">;

export interface AuthResponse {
    user: SafeUser,
    accessToken: string;
    refreshToken: string;
}