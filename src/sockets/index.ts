import  {Server } from 'socket.io';
import {registerWhiteboardHandlers} from "./whiteboardSocket";



export const registerSockets = (io: Server) => {
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);
        registerWhiteboardHandlers(io, socket);
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        })
    })
}