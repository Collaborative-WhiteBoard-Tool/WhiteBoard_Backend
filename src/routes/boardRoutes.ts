import { Router } from "express";
import {validate} from "../middlewares/validateMiddleware";
import {boardIdSchema, createBoardSchema, updateBoardSchema} from "../schemas/boardSchema";
import * as boardController from "../controllers/boardController";


const router = Router();

router.post("/createBoard",validate(createBoardSchema, "body") , boardController.createBoard);
router.put("/:boardId", validate(boardIdSchema, "param"),validate(updateBoardSchema, "body") , boardController.updateBoard);
router.get("/:boardId", validate(boardIdSchema, "param") , boardController.getBoardData);
console.log("📌 roomRoutes loaded");

export default router;
