import { NextFunction, Request, Response } from "express"
import { createBoardService, getAllBoards, getOneBoardService, getUserWhiteboardsService } from "../services/boardService.js"
import { createNewBoardSchema } from "../schemas/boardSchema.js"
import { success } from "zod"
import { ApiResponse } from "../utils/apiResponse.js"
import AppError from "../utils/appError.js"



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
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const PAGE = Number(req.query.page)
    const LIMIT = Number(req.query.limit)
    try {
        const allBoards = await getAllBoards(PAGE, LIMIT)
        res.status(200).json(ApiResponse.success("SUCCESS", allBoards))
    } catch (error) {
        next(error)
    }
}

// Get by user share

export const getUserWhiteboardsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        const page = Number(req.params.page) || 1
        const limti = Number(req.params?.limit) || 8
        const allBoard = await getUserWhiteboardsService(userId, page, limti)
        res.status(200).json(ApiResponse.success("SUCCESS", allBoard))
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




