import {Server, Socket} from "socket.io";
import {ClearEvent, DrawEndEvent, DrawSegment} from "../types/socket.js";
import * as strokeService from "../services/strokeService.js";
import mongoose from "mongoose";
// import {handlerJoin} from "./handlers/joinHandler.js";
// import {handlerDraw} from "./handlers/drawHandler.js";
import { boardSocket } from "./board.socket.js";



export const registerWhiteboardHandlers = (io: Server) => {

    // Middleware validate boardId cho mọi kết nối
    // io.use(validateBoard);

    io.on("connection", (socket: Socket) => {
        console.log("✅ Client connected:", socket.id);
        // console.log("🌐 Handshake URL:", socket.handshake.url);

        // const boardId = (socket as any).boardId;
        // console.log(`✅ Client connected to board: ${boardId}`);

        // socket.on("joinBoard", (data) => handlerJoin(socket, data));
        // // server-side rate guard
        // // Trong lúc vẽ
        // socket.on("draw", async (data) => handlerDraw(socket, data));

        // // Khi kết thúc 1 stroke
        // socket.on("drawEnd", (data: DrawEndEvent) => {
        //     try {
        //         if (!socket.rooms.has(data.boardId)) return;
        //         socket.to(data.boardId).emit("drawEnd", data.strokeId);
        //         console.log(`✅ stroke ${data.strokeId} ended on board ${data.boardId}`);
        //     } catch (err) {
        //         console.error("Error on drawEnd: ", err);
        //     }
        // });



        // socket.on("clear", async ({ boardId }) => {
        //     try {
        //         if(!mongoose.Types.ObjectId.isValid(boardId)) {
        //             socket.emit("error", {message: "Invalid board id"});
        //             return;
        //         }
        //         await strokeService.clearBoardStrokes(boardId);
        //         io.to(boardId).emit("clear");
        //         console.log(`🧹 Board ${boardId} cleared successfully`);
        //     }catch (err){
        //         console.error("❌ Error clearing board:", err);
        //         socket.emit("error", { message: "Failed to clear board" });
        //     }
        // })

        // socket.on("disconnect", () => {
        //     console.log(`❌ User disconnected: ${socket.id}`);
        // });



        boardSocket(io, socket)
    })
};
