import prisma from "../config/prisma.js"

export const getAllBoards = async () => {

  return await prisma.user.findMany()

}


