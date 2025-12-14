import {Request, Response} from "express";
import * as boardService from "../services/boardService";
import * as strokeService from "../services/strokeService";
import {Socket} from "socket.io";
import {boardIdSchema, JoinBoardPayload, joinBoardSchema} from "../schemas/boardSchema";
import {ApiResponse} from "../utils/ApiResponse";
import {createBoardDto} from "../dtos/board.dto";
import {RESPONSE_CODES} from "../constants/responseCodes";

// export const handlerJoinBoard = async (socket: Socket, payload: JoinBoardPayload) => {
//     try {
//         const {boardId, userId} = joinBoardSchema.parse(payload);
//         socket.join(boardId.boardId);
//         const strokes = await strokeService.getStrokeByBoard(boardId.boardId);
//         socket.emit("loadBoard", strokes);
//         socket.broadcast.to(boardId.boardId).emit(" userJoined", userId);
//         console.log(`User ${userId} joined board ${boardId}`);
//     }catch (err) {
//         console.error("Error on joinBoard", err);
//
//     }
// }


export const createBoard = async (req: Request, res: Response) => {
    console.log("Create board:", req.body);
    try {
        const dto = createBoardDto.parse(req.body);
        const board = await boardService.createBoard(dto.title, dto.owner);
        const response = ApiResponse.success("SUCCESS", board);
        res.status(RESPONSE_CODES.CREATED.httpStatus).json(response);
    } catch (error) {
        const response = ApiResponse.error("VALIDATION_ERROR", error);
        res.status(RESPONSE_CODES.VALIDATION_ERROR.httpStatus).json(response);
        console.error(error);
    }
};

export const updateBoard = async (req: Request, res: Response) => {
    try {
        const data = await boardService.getBoardId(req.params.boardId);
        if (!data) {
            return res.status(RESPONSE_CODES.BOARD_NOT_FOUND.httpStatus).json(ApiResponse.error("BOARD_NOT_FOUND"));
        }
        const dto = createBoardDto.parse(req.body);
        const board = await boardService.updateBoard(req.params.boardId, dto);
        const response = ApiResponse.success("UPDATED", board);
        res.status(RESPONSE_CODES.SUCCESS.httpStatus).json(response);
    } catch (error) {
        res.status(RESPONSE_CODES.INTERNAL_ERROR.httpStatus).json(ApiResponse.error("INTERNAL_ERROR"));
    }
}

export const getBoardData = async (req: Request, res: Response) => {
    try {
        const data = await boardService.getBoardWithStrokes(req.params.boardId);
        if (!data) {
            return res.status(RESPONSE_CODES.BOARD_NOT_FOUND.httpStatus).json(ApiResponse.error("BOARD_NOT_FOUND"));
        }
        res.status(RESPONSE_CODES.SUCCESS.httpStatus).json(ApiResponse.success("SUCCESS", data));
    } catch (err: unknown) {
        console.error("Emi", err);
        res.status(RESPONSE_CODES.INTERNAL_ERROR.httpStatus).json(ApiResponse.error("INTERNAL_ERROR", err));
    }
};
