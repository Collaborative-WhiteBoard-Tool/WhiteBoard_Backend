import express from "express";
import cors from "cors";
import { logger } from "./utils/logger.js";
import roomRoutes from "./routes/boardRoutes.js";
import authRoutes from "./routes/authRouteres.js";
import errorHandler from "./middlewares/errorHandler.js";
import AppError from "./utils/appError.js";
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(logger);

// app.use(corsMiddleware)

app.use(cookieParser());
app.use("/boards", roomRoutes);
app.use("/auth", authRoutes);

app.use((req, res, next) => {
  next(new AppError("NOT_FOUND"));
})

app.use(errorHandler)

export default app;
