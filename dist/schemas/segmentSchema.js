"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawSegmentSchema = void 0;
const zod_1 = require("zod");
exports.drawSegmentSchema = zod_1.z.object({
    boardId: zod_1.z.string(), // Hoặc z.string().uuid() nếu em dùng UUID
    strokeId: zod_1.z.string(),
    x: zod_1.z.number(),
    y: zod_1.z.number(),
    pressure: zod_1.z.number().optional(),
});
//# sourceMappingURL=segmentSchema.js.map