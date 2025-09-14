"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerDraw = void 0;
const segmentSchema_1 = require("../../schemas/segmentSchema");
const strokeService = __importStar(require("../../services/strokeService"));
let lastDrawTs = 0;
const MIN_INTERVAL_MS = 12;
const handlerDraw = async (socket, payload) => {
    try {
        const data = segmentSchema_1.drawSegmentSchema.parse(payload);
        if (!socket.rooms.has(data.boardId)) {
            console.warn(`Rejected draw from ${socket.id} for board ${data.boardId} (not joined)`);
            return;
        }
        const now = Date.now();
        if (now - lastDrawTs < MIN_INTERVAL_MS)
            return;
        lastDrawTs = now;
        await strokeService.saveStroke(data);
        socket.to(data.boardId).emit("draw", data);
        console.log(`✏️ ${data.boardId} drawing on board ${data.boardId} --- SocketID: ${socket.id}`);
    }
    catch (err) {
        console.error("Error on draw handler: ", err);
        socket.emit("error", { message: "Failed to draw" });
    }
};
exports.handlerDraw = handlerDraw;
//# sourceMappingURL=drawHandler.js.map