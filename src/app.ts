import express from "express";
import cors from "cors";
import { logger } from "./utils/logger";
import roomRoutes from "./routes/boardRoutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/", (_req, res) => {
  res.send("✅ Whiteboard Backend Running!");
});

app.use("/boards", roomRoutes);
console.log("✅ Boards routes registered!");
export default app;
