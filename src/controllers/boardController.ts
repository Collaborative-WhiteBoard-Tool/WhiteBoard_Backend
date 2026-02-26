import { NextFunction, Request, Response } from "express"
import { createBoardService, downloadBoardDataService, getDeletedBoardsService, getOneBoardService, getOwnedBoardsService, getSharedBoardsService, getUserWhiteboardsService, permanentlyDeleteBoardService, renameBoardService, restoreBoardService, shareBoardService, softDeleteBoardService, toggleFavoriteService } from "../services/boardService.js"
import { createNewBoardSchema, shareBoardSchema, toggleFavoriteSchema, updateBoardTitleSchema, updateThumbnailSchema } from "../schemas/boardSchema.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import AppError from "../utils/appError.js"
import { checkAccess, getBoardById, updateThumbnail } from "../repository/board.repository.js"



export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id
        const dataBoard = createNewBoardSchema.parse(req.validated?.body)
        const newBoard = await createBoardService(userId, dataBoard)
        res.status(201).json(ApiResponse.success("SUCCESS", newBoard))
        console.log('Created success')
    } catch (error) {
        next(error)
    }
}


// GetAll
// export const getAll = async (req: Request, res: Response, next: NextFunction) => {
//     const PAGE = Number(req.query.page)
//     const LIMIT = Number(req.query.limit)
//     try {
//         const allBoards = await getAllBoards(PAGE, LIMIT)
//         res.status(200).json(ApiResponse.success("SUCCESS", allBoards))
//     } catch (error) {
//         next(error)
//     }
// }

// Get by user share /main
export const getUserWhiteboardsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id
        console.log(userId)
        const page = Number(req.query.page) || 1
        const limti = Number(req.query?.limit) || 8
        const allBoard = await getUserWhiteboardsService(userId, page, limti)
        res.status(200).json(ApiResponse.success("SUCCESS", allBoard))
        console.log('')
    } catch (error) {
        next(error)
    }
}


export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: boardId } = req.params
        const board = await getOneBoardService(boardId)
        if (!board) {
            return next(new AppError("BOARD_NOT_FOUND"))
        }

        res.status(200).json(ApiResponse.success("SUCCESS", board))
    } catch (error) {
        next(error)
    }
}


export const updateBoardThumbnail = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id; // From auth middleware

        // Validate input
        const data = updateThumbnailSchema.parse(req.body);

        // Check access
        const access = await checkAccess(boardId, userId);
        if (!access.hasAccess || access.role === 'VIEWER') {
            throw new AppError('FORBIDDEN');
        }

        // Get current board to find old thumbnail
        const board = await getBoardById(boardId);

        // Update thumbnail
        await updateThumbnail(
            boardId,
            data,
            board?.thumbnailPublicId || undefined
        );

        res.status(200).json({
            success: true,
            message: 'Thumbnail updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const renameBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id;
        const data = updateBoardTitleSchema.parse(req.body);

        await renameBoardService(boardId, userId, data);

        res.status(200).json(ApiResponse.success("SUCCESS"));
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 2. TOGGLE FAVORITE
 * PATCH /api/boards/:boardId/favorite
 */
export const toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id;
        const data = toggleFavoriteSchema.parse(req.body);

        await toggleFavoriteService(boardId, userId, data);

        res.status(200).json(ApiResponse.success("SUCCESS"));
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 3. SOFT DELETE (Move to Trash)
 * DELETE /api/boards/:boardId
 */
export const softDeleteBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id;

        await softDeleteBoardService(boardId, userId);

        res.status(200).json(ApiResponse.success("SUCCESS"));
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 4. RESTORE BOARD
 * POST /api/boards/:boardId/restore
 */
export const restoreBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id;

        await restoreBoardService(boardId, userId);

        res.status(200).json(ApiResponse.success("SUCCESS"));
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 5. PERMANENTLY DELETE
 * DELETE /api/boards/:boardId/permanent
 */
export const permanentlyDeleteBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id;

        await permanentlyDeleteBoardService(boardId, userId);

        res.status(200).json(ApiResponse.success("SUCCESS"));
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 6. SHARE BOARD
 * POST /api/boards/:boardId/share
 */
export const shareBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id;
        const data = shareBoardSchema.parse(req.body);

        await shareBoardService(boardId, userId, data);

        res.status(200).json(ApiResponse.success("SUCCESS"));
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 7. GET DELETED BOARDS (Trash)
 * GET /api/boards/trash
 */
export const getDeletedBoards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('🗑️ GET /boards/trash called');
        console.log('👤 User ID:', req.user?.id);
        const userId = req.user!.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;
        console.log('📊 Fetching deleted boards:', { userId, page, limit });

        const deletedBoards = await getDeletedBoardsService(userId, page, limit);

        console.log('✅ Found deleted boards:', deletedBoards.total);
        res.status(200).json(ApiResponse.success("SUCCESS", deletedBoards));
    } catch (error) {
        console.error('❌ Error in getDeletedBoards:', error);
        next(error);
    }
};

/**
 * ✅ 8. DOWNLOAD BOARD
 * GET /api/boards/:boardId/download
 */
export const downloadBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const userId = req.user!.id;

        const boardData = await downloadBoardDataService(boardId, userId);

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="board-${boardId}.json"`);

        res.status(200).json(boardData);
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 9. GET BOARDS OWNED BY USER
 * GET /api/boards/owned
 */
export const getOwnedBoards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;

        const ownedBoards = await getOwnedBoardsService(userId, page, limit);

        res.status(200).json(ApiResponse.success("SUCCESS", ownedBoards));
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 10. GET BOARDS SHARED WITH USER
 * GET /api/boards/shared
 */
export const getSharedBoards = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;

        const sharedBoards = await getSharedBoardsService(userId, page, limit);

        res.status(200).json(ApiResponse.success("SUCCESS", sharedBoards));
    } catch (error) {
        next(error);
    }
};