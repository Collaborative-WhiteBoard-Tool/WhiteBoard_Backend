import prisma from "../config/prisma.js"
import { RegisterDTO } from "../schemas/userSchema.js"
import { SafeUser } from "../types/auth.type.js"
import AppError from "../utils/appError.js"




export const registerRepository = async (payload: RegisterDTO): Promise<SafeUser> => {
    const user = await prisma.user.create({ data: payload })
    const { password: _pw, ...safeUser } = user

    return safeUser

}

export const findUserPublicById = async (id: string): Promise<SafeUser> => {
    const user = await prisma.user.findUnique({
        where: { id }
    });
    if (!user) {
        throw new AppError("NOT_FOUND");
    }
    const { password: _pw, ...safeUser } = user
    return safeUser
}

