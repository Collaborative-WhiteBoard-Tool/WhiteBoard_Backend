import { Socket } from "socket.io";
import { boardIdSchema } from "../schemas/boardSchema";
import mongoose from "mongoose";

export const validateBoard = (socket: Socket, next: any) => {
    console.log("validateBoard ")
    try {
        const boardId = socket.handshake.query.boardId as string || (socket.data?.boardId as string);
        // ✅ Validate bằng Zod schema
        if (!boardId) return next(new Error("BoardId is required"));
        boardIdSchema.parse({boardId});

        // ✅ Convert sang ObjectId cho đồng bộ DB
        (socket as any).boardId = new mongoose.Types.ObjectId(boardId);

        next();
        console.log("validateBoard ok")
    } catch (err: any) {
        console.log("validateBoard fail")
        next(new Error("BoardId validation failed: " + err.message));
    }
};
