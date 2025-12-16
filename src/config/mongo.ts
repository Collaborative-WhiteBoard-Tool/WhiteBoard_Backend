import {MongoClient, Db} from 'mongodb';
import { ENV } from './env.js';
import 'dotenv/config'

const uri = ENV.MONGO.URI!;
const client = new MongoClient(uri, {maxPoolSize: 10})
let db : Db
export const connectMongo = async () => {
    try {
        await client.connect()
        db = client.db("whiteboard_db")
        console.log("✅ MongoDB connected:", db.databaseName);
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
}

export const getDB = () => {
    if(!db) throw new Error("mongo not connected")
    return db
}
