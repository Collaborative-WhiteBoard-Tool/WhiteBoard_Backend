"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBoardId = exports.createBoard = void 0;
const Boards_1 = __importDefault(require("../models/Boards"));
const createBoard = async (name) => {
    const board = new Boards_1.default({ name });
    return await board.save();
};
exports.createBoard = createBoard;
const getBoardId = async (id) => {
    return await Boards_1.default.findById(id);
};
exports.getBoardId = getBoardId;
//# sourceMappingURL=boardService.js.map