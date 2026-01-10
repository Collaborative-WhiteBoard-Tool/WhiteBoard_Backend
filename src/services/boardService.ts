import { createBoardRepository, getBoardByIdRepository, getUserWhiteboardsRepository } from "../repository/board.repository.js"
import { CreateNewBoardDTO } from "../schemas/boardSchema.js"
import { BoardResponse } from "../types/whiteboard.type.js"

// export const getAllBoards = async (page: number, limit: number): Promise<ListBoardsResponseData> => {
//   const skip = (page - 1) * limit
//   const [boards, total] = await Promise.all([
//     findBoards(skip, limit),
//     countBoards()
//   ])
//   return { boards, total, page, limit, totalPages: Math.ceil(total / limit) }
// }

export const createBoardService = async (ownerId: string, payload: CreateNewBoardDTO): Promise<BoardResponse> => {
  return await createBoardRepository(ownerId, payload)
}

export const getOneBoardService = async (boardId: string) => {
  return await getBoardByIdRepository(boardId)
}


export const getUserWhiteboardsService = async (userId?: string, page?: number, limit?: number) => {
  return await getUserWhiteboardsRepository(userId, page, limit)
}