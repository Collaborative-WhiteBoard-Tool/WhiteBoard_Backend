import { NextFunction, Request, Response } from "express"
import { createBoardService, getOneBoardService, getUserWhiteboardsService } from "../services/boardService.js"
import { createNewBoardSchema, updateThumbnailSchema } from "../schemas/boardSchema.js"
import { ApiResponse } from "../utils/apiResponse.js"
import AppError from "../utils/appError.js"
import { checkAccess, getBoardById, updateThumbnail } from "../repository/board.repository.js"



export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id
        const dataBoard = createNewBoardSchema.parse(req.validated?.body)
        const newBoard = await createBoardService(userId, dataBoard)
        res.status(201).json(ApiResponse.success("SUCCESS", newBoard))
        console.log('Created success')
    } catch (error) {
        next(error)
    }
}


// GetAll
// export const getAll = async (req: Request, res: Response, next: NextFunction) => {
//     const PAGE = Number(req.query.page)
//     const LIMIT = Number(req.query.limit)
//     try {
//         const allBoards = await getAllBoards(PAGE, LIMIT)
//         res.status(200).json(ApiResponse.success("SUCCESS", allBoards))
//     } catch (error) {
//         next(error)
//     }
// }

// Get by user share /main
export const getUserWhiteboardsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        console.log(userId)
        const page = Number(req.query.page) || 1
        const limti = Number(req.query?.limit) || 8
        const allBoard = await getUserWhiteboardsService(userId, page, limti)
        res.status(200).json(ApiResponse.success("SUCCESS", allBoard))
        console.log('')
    } catch (error) {
        next(error)
    }
}


export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: boardId } = req.params
        const board = await getOneBoardService(boardId)
        if (!board) {
            return next(new AppError("BOARD_NOT_FOUND"))
        }

        res.status(200).json(ApiResponse.success("SUCCESS", board))
    } catch (error) {
        next(error)
    }
}


export const updateBoardThumbnail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id; // From auth middleware

        // Validate input
        const data = updateThumbnailSchema.parse(req.body);

        // Check access
        const access = await checkAccess(boardId, userId);
        if (!access.hasAccess || access.role === 'VIEWER') {
            throw new AppError('FORBIDDEN');
        }

        // Get current board to find old thumbnail
        const board = await getBoardById(boardId);

        // Update thumbnail
        await updateThumbnail(
            boardId,
            data,
            board?.thumbnailPublicId || undefined
        );

        res.status(200).json({
            success: true,
            message: 'Thumbnail updated successfully',
        });
    } catch (error) {
        next(error);
    }
};