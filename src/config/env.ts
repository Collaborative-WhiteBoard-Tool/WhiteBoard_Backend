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
  }
};
