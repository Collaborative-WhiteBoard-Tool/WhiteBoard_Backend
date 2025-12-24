import { NextFunction, Request, Response } from "express"
import { getAllBoards } from "../services/boardService.js"

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const board = await getAllBoards()
    return res.json({ mes: "Ok", data: board })
}


