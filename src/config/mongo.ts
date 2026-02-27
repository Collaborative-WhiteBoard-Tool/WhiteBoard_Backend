import { MongoClient, Db } from 'mongodb';
import { ENV } from './env.js';
import 'dotenv/config'
import AppError from '../utils/appError.js';

const uri = ENV.MONGO.URI;
if (!uri) {
    throw new AppError("MONGO_URI_NOT_DEFINED");
}
const client = new MongoClient(uri, { maxPoolSize: 10 })
let db: Db
export const connectMongo = async (): Promise<Db> => {
    try {
        await client.connect()
        db = client.db("whiteboard_db")
        console.log("✅ MongoDB connected:", db.databaseName);
        await createIndexes()
        return db
    } catch (err: unknown) {
        console.error("❌ MongoDB connection error:", err);
        // console.log({
        //     name: err.name,
        //     message: err.message,
        //     code: err.code,
        // })
        throw new AppError("CANNOT_CONNECT_MONGODB")
    }
}


export const getDB = () => {
    if (!db) throw new Error("mongo not connected")
    return db
}


const createIndexes = async () => {
    if (process.env.NODE_ENV !== 'development') {
        console.log('ℹ️ Skip index creation in production');
        return;
    }

    db = getDB();
    await db.collection("strokes").createIndex({ whiteboardId: 1, createdAt: 1 });
    console.log('✅ Database indexes created');
};


export const closeMongoDB = async (): Promise<void> => {
    if (client) {
        await client.close();
        console.log('✅ MongoDB connection closed');
    }
};