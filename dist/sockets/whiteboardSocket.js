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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWhiteboardHandlers = void 0;
const validateBoard_1 = require("../middlewares/validateBoard");
const strokeService = __importStar(require("../services/strokeService"));
const mongoose_1 = __importDefault(require("mongoose"));
const joinHandler_1 = require("./handlers/joinHandler");
const drawHandler_1 = require("./handlers/drawHandler");
const registerWhiteboardHandlers = (io) => {
    // Middleware validate boardId cho mọi kết nối
    io.use(validateBoard_1.validateBoard);
    io.on("connection", (socket) => {
        const boardId = socket.boardId;
        console.log(`✅ Client connected to board: ${boardId}`);
        socket.on("joinBoard", (data) => (0, joinHandler_1.handlerJoin)(socket, data));
        // server-side rate guard
        // Trong lúc vẽ
        socket.on("draw", async (data) => (0, drawHandler_1.handlerDraw)(socket, data));
        // Khi kết thúc 1 stroke
        socket.on("drawEnd", (data) => {
            try {
                if (!socket.rooms.has(data.boardId))
                    return;
                socket.to(data.boardId).emit("drawEnd", data.strokeId);
                console.log(`✅ stroke ${data.strokeId} ended on board ${data.boardId}`);
            }
            catch (err) {
                console.error("Error on drawEnd: ", err);
            }
        });
        socket.on("clear", async ({ boardId }) => {
            try {
                if (!mongoose_1.default.Types.ObjectId.isValid(boardId)) {
                    socket.emit("error", { message: "Invalid board id" });
                    return;
                }
                await strokeService.clearBoardStrokes(boardId);
                io.to(boardId).emit("clear");
                console.log(`🧹 Board ${boardId} cleared successfully`);
            }
            catch (err) {
                console.error("❌ Error clearing board:", err);
                socket.emit("error", { message: "Failed to clear board" });
            }
        });
        socket.on("disconnect", () => {
            console.log(`❌ User disconnected: ${socket.id}`);
        });
    });
};
exports.registerWhiteboardHandlers = registerWhiteboardHandlers;
//# sourceMappingURL=whiteboardSocket.js.map