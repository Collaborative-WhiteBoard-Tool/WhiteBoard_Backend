"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = connectMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
async function connectMongo() {
    try {
        const uri = env_1.ENV.MONGO.URI;
        await mongoose_1.default.connect(uri, {
            dbName: env_1.ENV.MONGO.DB_NAME,
        });
        console.log("Connected to MongoDB");
    }
    catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}
//# sourceMappingURL=mongo.js.map