import { Server, Socket } from "socket.io";
import {ClearEvent, DrawEndEvent, DrawEvent} from "../types/socket";

export const registerWhiteboardHandlers = (io: Server, socket: Socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Người dùng join vào một whiteboard (theo id)
  socket.on("joinBoard", (boardId: string) => {
    socket.join(boardId);
    console.log(`👥 ${socket.id} joined board ${boardId}`);
  })

  // Trong lúc vẽ
  socket.on(  "draw", (data : DrawEvent) => {
    socket.to(data.boardId).emit("draw", data.segment);
    console.log(`✏️ ${data.userId} drawing on board ${data.boardId}`);
  });


  // Khi kết thúc 1 stroke
  socket.on(  "drawEnd", (data : DrawEndEvent) => {
    socket.to(data.boardId).emit("drawEnd", data.strokeId);
    console.log(`✅ stroke ${data.strokeId} ended on board ${data.boardId}`);
  });


  socket.on("clear", (data : ClearEvent) => {
    socket.to(data.boardId).emit("clear");
    console.log(`🧹 ${data.userId} cleared board ${data.boardId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
};
