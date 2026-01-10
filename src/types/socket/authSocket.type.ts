import { Socket } from "socket.io";

export interface AuthSocketPayload extends Socket {
    userId?: string;
    userName?: string;
    whiteBoardId?: string;
}