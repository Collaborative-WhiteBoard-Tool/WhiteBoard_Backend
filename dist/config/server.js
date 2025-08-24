"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("../config/db")); // lấy kết nối MySQL từ db.ts
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// ⚡ Khởi tạo socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Route test API
app.get("/", (req, res) => {
    res.send("✅ Backend server is running!");
});
// Test kết nối DB
app.get("/db-check", async (req, res) => {
    try {
        const [rows] = await db_1.default.query("SELECT NOW() as now");
        res.json(rows);
    }
    catch (error) {
        console.error("DB error:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});
// Socket.io events
io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);
    // Ví dụ: nhận vẽ từ client
    socket.on("draw", (data) => {
        // broadcast cho các client khác
        socket.broadcast.emit("draw", data);
    });
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});
// Port từ .env hoặc mặc định 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map