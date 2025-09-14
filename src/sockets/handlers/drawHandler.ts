import {drawSegmentSchema} from "../../schemas/segmentSchema";
import * as strokeService from "../../services/strokeService";

let lastDrawTs = 0;
const MIN_INTERVAL_MS = 12;
export const handlerDraw = async (socket: any, payload: any) => {

    try {
        const data = drawSegmentSchema.parse(payload);

        if (!socket.rooms.has(data.boardId)) {
            console.warn(`Rejected draw from ${socket.id} for board ${data.boardId} (not joined)`);
            return;
        }
        const now = Date.now();
        if (now - lastDrawTs < MIN_INTERVAL_MS) return;
        lastDrawTs = now;

        await strokeService.saveStroke(data);
        socket.to(data.boardId).emit("draw", data);
        console.log(`✏️ ${data.boardId} drawing on board ${data.boardId} --- SocketID: ${socket.id}`);
    } catch (err) {
        console.error("Error on draw handler: ", err);
        socket.emit("error", {message: "Failed to draw"});
    }
}

