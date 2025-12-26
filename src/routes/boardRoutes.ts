import { Router } from "express";

import * as boardController from "../controllers/boardController.js";
import { protect } from "../middlewares/auth/authMiddleware.js";
import { validated } from "../middlewares/validateMiddleware.js";
import { createNewBoardSchema } from "../schemas/boardSchema.js";
const router = Router();

router.get('/', boardController.getUserWhiteboardsController)
router.get('/:id', boardController.getOne)
router.post('/', protect, validated(createNewBoardSchema, "body"), boardController.createBoard)


export default router;
