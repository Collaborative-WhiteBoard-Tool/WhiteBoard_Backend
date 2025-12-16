import express from "express";
import cors from "cors";
import { logger } from "./utils/logger.js";
import roomRoutes from "./routes/boardRoutes.js";
import strokeRouter from "./routes/strokeRouter.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/boards", roomRoutes);
app.use("/stroke", strokeRouter);

app.get("/", (_req, res) => {
  res.send("✅ Whiteboard Backend Running!");
});

export default app;
