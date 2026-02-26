import { createBoardRepository, downloadBoardDataRepository, getBoardByIdRepository, getDeletedBoardsRepository, getOwnedBoardsRepository, getSharedBoardsRepository, getUserWhiteboardsRepository, permanentlyDeleteBoardRepository, renameBoardRepository, restoreBoardRepository, shareBoardRepository, softDeleteBoardRepository, toggleFavoriteRepository } from "../repository/board.repository.js"
import { CreateNewBoardDTO, ShareBoardDTO, ToggleFavoriteDTO, UpdateBoardTitleDTO } from "../schemas/boardSchema.js"
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


export const renameBoardService = async (
    boardId: string,
    userId: string,
    data: UpdateBoardTitleDTO
) => {
    return await renameBoardRepository(boardId, userId, data);
};

export const toggleFavoriteService = async (
    boardId: string,
    userId: string,
    data: ToggleFavoriteDTO
) => {
    return await toggleFavoriteRepository(boardId, userId, data);
};

export const softDeleteBoardService = async (
    boardId: string,
    userId: string
) => {
    return await softDeleteBoardRepository(boardId, userId);
};

export const restoreBoardService = async (
    boardId: string,
    userId: string
) => {
    return await restoreBoardRepository(boardId, userId);
};

export const permanentlyDeleteBoardService = async (
    boardId: string,
    userId: string
) => {
    return await permanentlyDeleteBoardRepository(boardId, userId);
};

export const shareBoardService = async (
    boardId: string,
    userId: string,
    data: ShareBoardDTO
) => {
    return await shareBoardRepository(boardId, userId, data);
};

export const getDeletedBoardsService = async (
    userId: string,
    page?: number,
    limit?: number
) => {
    return await getDeletedBoardsRepository(userId, page, limit);
};

export const downloadBoardDataService = async (
    boardId: string,
    userId: string
) => {
    return await downloadBoardDataRepository(boardId, userId);
};


export const getOwnedBoardsService = async (
    userId: string,
    page?: number,
    limit?: number
) => {
    return await getOwnedBoardsRepository(userId, page, limit);
};

export const getSharedBoardsService = async (
    userId: string,
    page?: number,
    limit?: number
) => {
    return await getSharedBoardsRepository(userId, page, limit);
};