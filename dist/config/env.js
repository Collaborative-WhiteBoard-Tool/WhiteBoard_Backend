"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: process.env.PORT || 5000,
    DB: {
        HOST: process.env.DB_HOST || "localhost",
        PORT: Number(process.env.DB_PORT) || 3306,
        USER: process.env.DB_USER || "root",
        PASS: process.env.DB_PASS || "12345",
        NAME: process.env.DB_NAME || "whiteboard_db",
    },
    MONGO: {
        URI: process.env.MONGO_URI || "mongodb://localhost:27017",
        DB_NAME: process.env.MONGO_DB_NAME || "whiteboard_db",
    }
};
//# sourceMappingURL=env.js.map