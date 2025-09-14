import http from "http";
import {Server} from "socket.io";
import app from "./app";
import {ENV} from "./config/env";
import {registerSockets} from "./sockets";
import {connectMongo} from "./config/mongo";

const server = http.createServer(app);
const io = new Server(server, {cors: {origin: "*", methods: ["GET", "POST"]},});
registerSockets(io);
connectMongo();
server.listen(ENV.PORT, () => {
    console.log(`🚀Server is running at http:localhost:${ENV.PORT}`);
});
  