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
exports.handlerJoin = void 0;
const boardSchema_1 = require("../../schemas/boardSchema");
const strokeService = __importStar(require("../../services/strokeService"));
const handlerJoin = async (socket, payload) => {
    const { boardId, userId } = boardSchema_1.joinBoardSchema.parse(payload);
    socket.join(boardId.toString()); // Tham gia room theo boardId(cần kiểu string)
    console.log(`User ${userId} joined board ${boardId}`);
    //Gửi strokes hiện tại cho user mới
    const strokes = await strokeService.getStrokeByBoard(boardId);
    socket.emit("loadBoard", strokes);
    //Boardcast thông báo có người join
    socket.broadcast.to(boardId.toString()).emit("userJoined", userId);
    console.log(`User ${userId} joined board ${boardId}`);
};
exports.handlerJoin = handlerJoin;
//# sourceMappingURL=joinHandler.js.map