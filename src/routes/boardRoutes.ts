import { Router } from "express";

import * as boardController from "../controllers/boardController.js";
import { protect } from "../middlewares/auth/authMiddleware.js";
import { validated } from "../middlewares/validateMiddleware.js";
import { createNewBoardSchema } from "../schemas/boardSchema.js";
const router = Router();

router.get('/trash', protect, boardController.getDeletedBoards);


router.get('/owned', protect, boardController.getOwnedBoards);
router.get('/shared', protect, boardController.getSharedBoards);

router.get('/', protect, boardController.getUserWhiteboardsController)
router.post('/', protect, validated(createNewBoardSchema, "body"), boardController.createBoard)
router.patch('/:boardId/thumbnail', protect, boardController.updateBoardThumbnail)

router.put('/:boardId/rename', protect, boardController.renameBoard);
router.patch('/:boardId/favorite', protect, boardController.toggleFavorite);
router.post('/:boardId/restore', protect, boardController.restoreBoard);
router.delete('/:boardId/permanent', protect, boardController.permanentlyDeleteBoard);
router.post('/:boardId/share', protect, boardController.shareBoard);
router.get('/:boardId/download', protect, boardController.downloadBoard);
router.delete('/:boardId', protect, boardController.softDeleteBoard);
router.get('/:id', protect, boardController.getOne)

export default router;
