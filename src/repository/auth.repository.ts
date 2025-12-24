import prisma from "../config/prisma.js"
import { CreateUserDTO } from "../schemas/userSchema.js"
import { SafeUser } from "../types/auth.type.js"




export const registerRepository = async (payload: CreateUserDTO): Promise<SafeUser> => {
    const user = await prisma.user.create({ data: payload })
    const { password: _pw, ...safeUser } = user

    return safeUser

}


