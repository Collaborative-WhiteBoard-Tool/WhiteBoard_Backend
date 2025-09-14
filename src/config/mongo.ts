import mongoose from 'mongoose';
import { ENV } from './env';

export async  function connectMongo(){
    try {
        const  uri = ENV.MONGO.URI;
        await mongoose.connect(uri, {
            dbName: ENV.MONGO.DB_NAME,
        });
        console.log("Connected to MongoDB")
    }catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}
