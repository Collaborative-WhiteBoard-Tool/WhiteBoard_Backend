import { Router } from "express";

import * as boardController from "../controllers/boardController.js";
const router = Router();

router.get('/', boardController.getAll)

export default router;
