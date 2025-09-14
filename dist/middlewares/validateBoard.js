"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBoard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validateBoard = (socket, next) => {
    try {
        const boardId = socket.handshake.query.boardId || socket.data?.boardId;
        if (!boardId || !mongoose_1.default.Types.ObjectId.isValid(boardId)) {
            return next(new Error("Invalid boardId"));
        }
        // convert sang ObjectId
        socket.boardId = new mongoose_1.default.Types.ObjectId(boardId);
        next();
    }
    catch (err) {
        next(new Error("BoarId validation failed: " + err.message));
    }
};
exports.validateBoard = validateBoard;
//# sourceMappingURL=validateBoard.js.map