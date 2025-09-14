"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
const pool = promise_1.default.createPool({
    host: env_1.ENV.DB.HOST,
    user: env_1.ENV.DB.USER,
    password: env_1.ENV.DB.PASS,
    database: env_1.ENV.DB.NAME,
    port: env_1.ENV.DB.PORT,
    waitForConnections: true,
    connectionLimit: 10,
});
exports.default = pool;
//# sourceMappingURL=db.js.map