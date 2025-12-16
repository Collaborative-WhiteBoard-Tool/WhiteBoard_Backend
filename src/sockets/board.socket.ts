import { Server, Socket } from "socket.io"
import * as strokeService from "../services/strokeService.js"
import { Stroke_1 } from "../models/Stroke.js"

export const boardSocket = (io: Server, socket: Socket) => {

  socket.on("board:join", async (boardId: string) => {
    socket.join(boardId)
    const strokes = await strokeService.loadBoard(boardId)
    socket.emit("board:loaded", strokes)
  })

  socket.on("stroke:create", async (data : Stroke_1) => {
    await strokeService.createStroke(data)
    socket.to(data.boardId).emit("stroke:created", data)
    console.log('draw stroke success!')
  })
  // sau này mở rộng sẽ dùng throttle để giảm tải spam -> mượt
//   socket.on(
//   "stroke:create",
//   throttle(async (data) => {
//     await strokeService.createStroke(data)
//     socket.to(data.boardId).emit("stroke:created", data)
//   }, 16)
// )


  socket.on("stroke:undo", async ({ boardId, userId }) => {
    const strokeId = await strokeService.undoStroke(boardId, userId)
    if (strokeId) {
      io.to(boardId).emit("stroke:undone", strokeId)
    }
  })
}
