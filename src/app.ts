import express from "express";
import cors from "cors";
import { logger } from "./utils/logger.js";
import roomRoutes from "./routes/boardRoutes.js";
import authRoutes from "./routes/authRouteres.js";
import oauthRoutes from "./routes/oauthRouteres.js";
import errorHandler from "./middlewares/errorHandler.js";
import AppError from "./utils/appError.js";
import cookieParser from 'cookie-parser';
import corsMiddleware from "./middlewares/corsMiddleware.js";
import passport, { configurePassport } from "./config/passport.js";

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(corsMiddleware)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(cookieParser());

configurePassport();
app.use(passport.initialize());

app.use("/boards", roomRoutes);
app.use("/auth", authRoutes);
app.use('/oauth', oauthRoutes);

app.use((req, res, next) => {
  next(new AppError("NOT_FOUND"));
})

app.use(errorHandler)

export default app;
