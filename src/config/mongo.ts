import { MongoClient, Db } from 'mongodb';
import { ENV } from './env.js';
import 'dotenv/config'
import AppError from '../utils/appError.js';

const uri = ENV.MONGO.URI!;
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
    db = getDB()
    db.collection("strokes").createIndex({ boardId: 1, createdAt: 1 })

    ////////// RefreshTokens collection indexes
    // await db.collection('refreshTokens').createIndex({ token: 1 }, { unique: true });
    // await db.collection('refreshTokens').createIndex({ userId: 1 });
    // await db.collection('refreshTokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✅ Database indexes created');
}


export const closeMongoDB = async (): Promise<void> => {
    if (client) {
        await client.close();
        console.log('✅ MongoDB connection closed');
    }
};