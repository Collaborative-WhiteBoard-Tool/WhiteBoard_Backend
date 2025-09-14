"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const sockets_1 = require("./sockets");
const mongo_1 = require("./config/mongo");
const server = http_1.default.createServer(app_1.default);
const io = new socket_io_1.Server(server, { cors: { origin: "*", methods: ["GET", "POST"] }, });
(0, sockets_1.registerSockets)(io);
(0, mongo_1.connectMongo)();
server.listen(env_1.ENV.PORT, () => {
    console.log(`🚀Server is running at http:localhost:${env_1.ENV.PORT}`);
});
//# sourceMappingURL=server.js.map