import { Router } from "express";
import {validate} from "../middlewares/validateMiddleware.js";
import {createBoardSchema, updateBoardSchema} from "../schemas/boardSchema.js";
import * as boardController from "../controllers/boardController.js";


const router = Router();


export default router;
