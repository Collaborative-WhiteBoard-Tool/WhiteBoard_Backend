"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSockets = void 0;
const whiteboardSocket_1 = require("./whiteboardSocket");
const registerSockets = (io) => {
    (0, whiteboardSocket_1.registerWhiteboardHandlers)(io);
};
exports.registerSockets = registerSockets;
//# sourceMappingURL=index.js.map