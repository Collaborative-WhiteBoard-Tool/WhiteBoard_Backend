import prisma from "../config/prisma.js";
import { RESPONSE_CODES } from "../constants/responseCodes.js";
import { registerRepository } from "../repository/auth.repository.js";
import { LoginDTO, RegisterDTO } from "../schemas/userSchema.js";
import { AuthResponse } from "../types/auth.type.js";
import AppError from "../utils/appError.js"
import { comparePassword, generateAccessToken, generateRefreshToken, hashPassword } from "../utils/auth.js"



export const registerService = async (payload: RegisterDTO): Promise<AuthResponse> => {

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
                message: RESPONSE_CODES.EMAIL_EXISTS.message
            }
        ])
    }
    if (existingUsername) {
        throw new AppError("USERNAME_EXISTS", [
            {
                field: "username",
                message: RESPONSE_CODES.USERNAME_EXISTS.message
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



export const loginService = async (payload: LoginDTO): Promise<AuthResponse> => {
    const user = await prisma.user.findUnique({
        where: { email: payload.email }
    })
    if (!user) {
        throw new AppError("ACCOUNT_NOT_REGISTERED", [{
            field: "email",
            message: RESPONSE_CODES.ACCOUNT_NOT_REGISTERED.message
        }])
    }
    const isMatch = await comparePassword(payload.password, user.password)
    if (!isMatch) {
        throw new AppError("PASSWORD_INCORRECT", [{
            field: "password",
            message: RESPONSE_CODES.PASSWORD_INCORRECT.message
        }])
    }
    const { password: _pw, ...safeUser } = user
    const accessToken = generateAccessToken({ id: user.id, email: user.email })
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email })
    // prisma.re
    return { user: safeUser, accessToken, refreshToken }
}