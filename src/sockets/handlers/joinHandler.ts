import { Socket } from "socket.io";
import { joinBoardSchema } from "../../schemas/boardSchema";
import * as strokeService from "../../services/strokeService";

export const handlerJoin = async (socket: Socket, payload: any) => {
    // Parse payload bằng schema
    const parsed = joinBoardSchema.parse(payload);

    const boardId = parsed.boardId.boardId; // string đã validate
    const userId = parsed.userId;

    // Tham gia room
    socket.join(boardId);
    console.log(`✅ User ${userId} joined board ${boardId}`);

    // Gửi strokes hiện tại cho user mới
    const strokes = await strokeService.getStrokeByBoard(boardId);
    socket.emit("loadBoard", strokes);

    // Broadcast thông báo có người join
    socket.broadcast.to(boardId).emit("userJoined", userId);
    console.log(`📢 User ${userId} broadcast joined board ${boardId}`);
};


import {Socket} from "socket.io";
import { joinBoardSchema} from "../../schemas/boardSchema";
import * as strokeService from "../../services/strokeService";

export const handlerJoin = async (socket: Socket, payload: any) => {
    const {boardId, userId} = joinBoardSchema.parse(payload);
    socket.join(boardId.boardId); // Tham gia room theo boardId
    console.log(`User ${userId} joined board ${boardId}`);
    //Gửi strokes hiện tại cho user mới
    const strokes = await strokeService.getStrokeByBoard(boardId.boardId);
    socket.emit("loadBoard", strokes);
    //Boardcast thông báo có người join
    socket.broadcast.to(boardId.toString()).emit("userJoined", userId);
    console.log(`User ${userId} joined board ${boardId}`);
}