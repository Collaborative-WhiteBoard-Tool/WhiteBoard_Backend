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
const mongoose_1 = __importStar(require("mongoose"));
const StrokeSchema = new mongoose_1.Schema({
    boardId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Board", required: true },
    userId: { type: String, required: false },
    strokeId: { type: String, required: true, unique: true },
    tool: {
        type: String,
        enum: ["pen", "eraser", "highlighter", "brush", "shape", "text", "laser"],
        default: "pen"
    },
    path: [{ x: Number, y: Number, pressure: Number }],
    shapeData: {
        type: {
            type: String,
            enum: ["rectangle", "circle", "line"],
            default: "rectangle"
        },
        x: Number,
        y: Number,
        width: Number,
        height: Number,
    },
    textContent: { type: String },
    color: { type: String, default: "#000000" },
    thickness: { type: Number, default: 2 },
    opacity: { type: Number, default: 1 },
    layer: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Stroke", StrokeSchema);
//# sourceMappingURL=Stroke.js.map