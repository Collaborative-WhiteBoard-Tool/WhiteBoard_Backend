"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearBoardStrokes = exports.getStrokeByBoard = exports.saveStroke = void 0;
const Stroke_1 = __importDefault(require("../models/Stroke"));
const mongoose_1 = __importDefault(require("mongoose"));
const saveStroke = async (strokeData) => {
    const stroke = new Stroke_1.default(strokeData);
    return await stroke.save();
};
exports.saveStroke = saveStroke;
const getStrokeByBoard = async (boardId) => {
    const id = typeof boardId === "string" ? new mongoose_1.default.Types.ObjectId(boardId) : boardId;
    return await Stroke_1.default.find({ boardId: id, deleted: false }).sort({ timestamp: 1 });
};
exports.getStrokeByBoard = getStrokeByBoard;
const clearBoardStrokes = async (boardId) => {
    return await Stroke_1.default.deleteMany({ boardId });
};
exports.clearBoardStrokes = clearBoardStrokes;
//# sourceMappingURL=strokeService.js.map