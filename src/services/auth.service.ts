import prisma from "../config/prisma.js";
import { registerRepository } from "../repository/auth.repository.js";
import { CreateUserDTO } from "../schemas/userSchema.js";
import { AuthResponse } from "../types/auth.type.js";
import AppError from "../utils/appError.js"
import { generateAccessToken, generateRefreshToken, hashPassword } from "../utils/auth.js"



export const registerService = async (payload: CreateUserDTO): Promise<AuthResponse> => {

    console.log("Register ")
    const [existingEmail, existingUsername] = await Promise.all([
        prisma.user.findUnique({
            where: { email: payload.email }
        }),
        prisma.user.findUnique({
            where: { username: payload.username }
        })
    ])
    if (existingEmail) {
        throw new AppError("EMAIL_EXISTS", [
            {
                field: "email",
                message: "Email already exists"
            }
        ])
    }
    if (existingUsername) {
        throw new AppError("USERNAME_EXISTS", [
            {
                field: "username",
                message: "Username already exists"
            }
        ])
    }

    const hashed = await hashPassword(payload.password)


    const user = await registerRepository({ ...payload, password: hashed })

    const accessToken = generateAccessToken({ id: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email })

    console.log("Password_enter: ", payload.password)
    return { user, accessToken, refreshToken }

};

