import  {Server } from 'socket.io';
import {registerWhiteboardHandlers} from "./whiteboardSocket";
export const registerSockets = (io: Server) => {
        registerWhiteboardHandlers(io);

}