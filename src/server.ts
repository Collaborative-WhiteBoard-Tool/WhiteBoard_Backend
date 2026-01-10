import http from "http";
import app from "./app.js";
import { ENV } from "./config/env.js";
import { closeMongoDB, connectMongo } from "./config/mongo.js";
import { createSocketManager, SocketManager } from "./sockets/socketManager.js";
import { connectRedis } from "./config/redis.js";


let socketManager: SocketManager;
const strartServer = async () => {
    try {
        const server = http.createServer(app);
        // const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] }, });

        await connectMongo()
        await connectRedis();
        socketManager = createSocketManager(server);
        server.listen(ENV.PORT, () => {
            console.log(`🚀Server is running at http:localhost:${ENV.PORT}`);
            console.log(`🔌Socket.IO ready for connections`);
        });
        // Graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

            if (socketManager) {
                await socketManager.cleanup();
            }

            await closeMongoDB()
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'))
        process.on('SIGINT', () => shutdown('SIGINT'))

        process.on('uncaughtException', (err) => {
            console.error('Chi tiết lỗi đây rồi:');
            console.error(err);
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Promise bị từ chối tại:', promise, 'Lý do:', reason);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}


strartServer()
