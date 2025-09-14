"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearBoardSchema = exports.drawEventEndSchema = exports.drawEventSchema = exports.joinBoardSchema = exports.authSchema = exports.boardIdSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
// Validate cho boardID
exports.boardIdSchema = zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), { message: "Invalid boardId" });
// Sau này có thể mở rộng thêm
exports.authSchema = zod_1.z.object({
    token: zod_1.z.string().optional(), // token (JWT / session key)
    role: zod_1.z.enum(["owner", "editor", "viewer"]).optional(),
});
//Schema join
exports.joinBoardSchema = zod_1.z.object({
    boardId: exports.boardIdSchema,
    userId: zod_1.z.string(),
});
////////////////////////////////////////
// Điểm vẽ
const pointSchema = zod_1.z.object({
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    pressure: zod_1.z.number().optional(),
});
// Shape
const shapeSchema = zod_1.z.object({
    type: zod_1.z.enum(["rectangle", "circle", "line"]),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    width: zod_1.z.number(),
    height: zod_1.z.number(),
});
// Cấu trúc base chung cho mọi event
const baseStrokeSchema = zod_1.z.object({
    boardId: exports.boardIdSchema,
    userId: zod_1.z.string().optional(),
    strokeId: zod_1.z.string(),
    tool: zod_1.z.enum(["pen", "eraser", "highlighter", "brush", "shape", "text", "laser"]),
    color: zod_1.z.string().optional(),
    thickness: zod_1.z.number().optional(),
    opacity: zod_1.z.number().optional(),
    layer: zod_1.z.number().optional(),
});
// Union schema tuỳ tool
exports.drawEventSchema = zod_1.z.discriminatedUnion("tool", [
    baseStrokeSchema.extend({
        tool: zod_1.z.enum(["pen", "eraser", "highlighter", "brush"]),
        path: zod_1.z.array(pointSchema).min(1),
    }),
    baseStrokeSchema.extend({
        tool: zod_1.z.literal("shape"),
        shapeData: shapeSchema,
    }),
    baseStrokeSchema.extend({
        tool: zod_1.z.literal("text"),
        textContent: zod_1.z.string().min(1),
        x: zod_1.z.number(),
        y: zod_1.z.number(),
    }),
    baseStrokeSchema.extend({
        tool: zod_1.z.literal("laser"),
        x: zod_1.z.number(),
        y: zod_1.z.number(),
    }),
]);
//Schema eventdrawEnd
exports.drawEventEndSchema = zod_1.z.object({
    boardId: exports.boardIdSchema,
    strokeId: zod_1.z.string(),
});
//Schema clear
exports.clearBoardSchema = zod_1.z.object({
    boardId: exports.boardIdSchema,
});
//# sourceMappingURL=boardSchema.js.map