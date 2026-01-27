import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT,
  MYSQL: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: Number(process.env.DB_PORT),
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
  },
  MONGO: {
    URI: process.env.MONGO_URI,
    DB_NAME: process.env.MONGO_DB_NAME
  },
  JWT: {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
  },
  CORS: {
    URL_CLIENT: process.env.URL_CLIENT
  },
  REDIS: {
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
  },
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
  },
  GOOGLE: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  },
  FRONTEND_URL: process.env.FRONTEND_URL
};
