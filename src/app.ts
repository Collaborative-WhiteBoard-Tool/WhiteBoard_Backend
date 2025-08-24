import express from "express";
import cors from "cors";
import { logger } from "./utils/logger";
import roomRoutes from "./routes/roomRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/", (_req, res) => {
  res.send("✅ Whiteboard Backend Running!");
});

app.use("/rooms", roomRoutes);

export default app;
