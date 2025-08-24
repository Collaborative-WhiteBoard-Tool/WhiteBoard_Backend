import { Router } from "express";
import { createRoom, getRooms } from "../controllers/roomController";

const router = Router();

router.post("/", createRoom);
router.get("/", getRooms);

export default router;
