import  {Server } from 'socket.io';
import {registerWhiteboardHandlers} from "./whiteboardSocket.js";
import { boardSocket } from './board.socket.js';
export const registerSockets = (io: Server) => {
        registerWhiteboardHandlers(io)
}

export default registerSockets