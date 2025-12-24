import express from "express";
import cors from "cors";
import { logger } from "./utils/logger.js";
import roomRoutes from "./routes/boardRoutes.js";
import authRoutes from "./routes/authRouteres.js";
import strokeRouter from "./routes/strokeRouter.js";
import errorHandler from "./middlewares/errorHandler.js";
import AppError from "./utils/appError.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/boards", roomRoutes);
app.use("/auth", authRoutes);
app.use("/stroke", strokeRouter);

app.use((req, res, next) => {
  next(new AppError("NOT_FOUND"));
})

app.use(errorHandler)

export default app;
