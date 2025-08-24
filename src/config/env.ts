import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  DB: {
    HOST: process.env.DB_HOST || "localhost",
    PORT: Number(process.env.DB_PORT) || 3306,
    USER: process.env.DB_USER || "sa",
    PASS: process.env.DB_PASS || "12345",
    NAME: process.env.DB_NAME || "whiteboard_db",
  },
};
