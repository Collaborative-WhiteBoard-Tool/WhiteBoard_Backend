import cloudinary from "../config/cloudinary.js"
import { ENV } from "../config/env.js"
import prisma from "../config/prisma.js"
import { CreateNewBoardDTO, ShareBoardDTO, ToggleFavoriteDTO, UpdateBoardTitleDTO, UpdateThumbnailDTO } from "../schemas/boardSchema.js"
import { sendShareBoardEmail } from "../services/emailService.js"
import { BoardResponse, ListBoardsResponse } from "../types/whiteboard.type.js"
import AppError from "../utils/appError.js"

export const createBoardRepository = async (ownerId: string, payload: CreateNewBoardDTO): Promise<BoardResponse> => {
    const board = await prisma.board.create({
        data: {
            title: payload.title,
            type: payload.type,
            ownerId
        },
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            owner: {
                select: {
                    id: true,
                    username: true,
                    displayName: true
                }
            },
            collaborators: {
                select: {
                    id: true,
                    role: true,
                    invitedAt: true,
                    acceptedAt: true,
                    user: {
                        select: {
                            username: true,
                            displayName: true
                        }
                    }
                }
            }
        }
    })
    return board
}


export const findBoards = async (skip: number, take: number) => {
    return await prisma.board.findMany({
        skip,
        take,
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            ownerId: true,
            type: true,
            createdAt: true,
            updatedAt: true,
        }
    })
}

export const countBoards = async () => {
    return await prisma.board.count()
}


export const getBoardByIdRepository = async (boardId: string): Promise<BoardResponse> => {
    const whiteboard = await prisma.board.findUnique({
        where: { id: boardId },
        select: {
            id: true,
            title: true,
            description: true,
            isPublic: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            owner: {
                select: {
                    username: true,
                    displayName: true
                }
            },
            collaborators: {
                include: {
                    user: {
                        select: {
                            username: true,
                            displayName: true
                        }
                    }
                }
            }
        }
    })
    if (!whiteboard) {
        throw new AppError("BOARD_NOT_FOUND");
    }
    return whiteboard
}

export const checkAccess = async (boardId: string, userId: string): Promise<{ hasAccess: boolean; role: 'OWNER' | 'EDITOR' | 'VIEWER' | null }> => {
    console.log(`Checking access for user ${userId} on board ${boardId}`);
    const board = await prisma.board.findFirst({
        where: {
            id: boardId,
        }
    })
    if (!board) {
        return { hasAccess: false, role: null };
    }
    if (board.ownerId === userId) {
        return { hasAccess: true, role: 'OWNER' };
    }
    if (board.isPublic) {
        return { hasAccess: true, role: 'VIEWER' };
    }

    // Collaborator check
    const collaborator = await prisma.boardCollaborator.findFirst({
        where: {
            userId: userId
        }
    })
    if (collaborator) {
        return { hasAccess: true, role: collaborator.role }
    }
    return { hasAccess: false, role: null };
}



// Update version (for optimistic locking)

export const incrementVersion = async (boardId: string): Promise<number> => {
    const board = await prisma.board.update({
        where: { id: boardId },
        data: {
            version: { increment: 1 },
        },
        select: {
            version: true,
        },
    });

    return board.version;
};


export const getUserWhiteboardsRepository = async (
    userId?: string,
    page: number = 1,
    limit: number = 8
): Promise<ListBoardsResponse> => {
    const skip = (page - 1) * limit;

    const [whiteboards, total] = await Promise.all([
        prisma.board.findMany({
            where: {
                isDeleted: false,  // ✅ Exclude deleted boards
                OR: [
                    { ownerId: userId },
                    {
                        collaborators: {
                            some: {
                                userId: userId,
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                title: true,
                description: true,
                isPublic: true,
                isFavorite: true,
                type: true,
                thumbnailUrl: true,
                createdAt: true,
                updatedAt: true,
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                collaborators: {
                    select: {
                        id: true,
                        role: true,
                        invitedAt: true,
                        acceptedAt: true,
                        user: {
                            select: {
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
            skip,
            take: limit,
        }),
        prisma.board.count({
            where: {
                isDeleted: false,
                OR: [
                    { ownerId: userId },
                    {
                        collaborators: {
                            some: {
                                userId: userId,
                            },
                        },
                    },
                ],
            },
        }),
    ]);

    return { whiteboards, total, page, limit };
};


export const updateThumbnail = async (
    boardId: string,
    data: UpdateThumbnailDTO,
    oldPublicId?: string
): Promise<void> => {
    // 1. Kiểm tra nếu URL mới giống hệt URL cũ thì bỏ qua (tránh tốn tài nguyên)
    // Cái này nên check ở Controller hoặc Service trước khi gọi hàm này
    console.log('Update thumbnail')
    // 2. Xóa ảnh cũ trên Cloudinary
    if (oldPublicId && oldPublicId !== data.thumbnailPublicId) {
        try {
            // Cloudinary destroy trả về { result: 'ok' } nếu thành công
            const result = await cloudinary.uploader.destroy(oldPublicId);
            console.log(`✅ Cloudinary: ${result.result} for ID: ${oldPublicId}`);
        } catch (error) {
            // Log lỗi nhưng không chặn việc update DB
            console.error('❌ Cloudinary Delete Error:', error);
        }
    }

    // 3. Cập nhật Database
    await prisma.board.update({
        where: { id: boardId },
        data: {
            thumbnailUrl: data.thumbnailUrl,
            thumbnailPublicId: data.thumbnailPublicId,
            thumbnailUpdatedAt: new Date(),
        },
    });
};

/**
     * Get board with thumbnail
     */
export const getBoardById = async (boardId: string) => {
    return prisma.board.findUnique({
        where: { id: boardId },
        select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            thumbnailPublicId: true,
            thumbnailUpdatedAt: true,
            isPublic: true,
            type: true,
            createdAt: true,
            updatedAt: true,
            owner: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                },
            },
        },
    });
}



export const renameBoardRepository = async (
    boardId: string,
    userId: string,
    data: UpdateBoardTitleDTO
): Promise<void> => {
    // Check ownership/permission
    const access = await checkAccess(boardId, userId);
    if (!access.hasAccess || access.role === 'VIEWER') {
        throw new AppError('FORBIDDEN');
    }

    await prisma.board.update({
        where: { id: boardId },
        data: { 
            title: data.title,
            updatedAt: new Date()
        },
    });
};

/**
 * ✅ 2. TOGGLE FAVORITE
 */
export const toggleFavoriteRepository = async (
    boardId: string,
    userId: string,
    data: ToggleFavoriteDTO
): Promise<void> => {
    // Check access
    const access = await checkAccess(boardId, userId);
    if (!access.hasAccess) {
        throw new AppError('FORBIDDEN');
    }

    await prisma.board.update({
        where: { id: boardId },
        data: { 
            isFavorite: data.isFavorite 
        },
    });
};

/**
 * ✅ 3. SOFT DELETE BOARD (Move to Trash)
 */
export const softDeleteBoardRepository = async (
    boardId: string,
    userId: string
): Promise<void> => {
    // Only owner can delete
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: { ownerId: true }
    });

    if (!board) {
        throw new AppError('BOARD_NOT_FOUND');
    }

    if (board.ownerId !== userId) {
        throw new AppError('FORBIDDEN');
    }

    await prisma.board.update({
        where: { id: boardId },
        data: {
            isDeleted: true,
            deletedAt: new Date()
        },
    });
};

/**
 * ✅ 4. RESTORE BOARD from Trash
 */
export const restoreBoardRepository = async (
    boardId: string,
    userId: string
): Promise<void> => {
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: { ownerId: true, isDeleted: true }
    });

    if (!board) {
        throw new AppError('BOARD_NOT_FOUND');
    }

    if (board.ownerId !== userId) {
        throw new AppError('FORBIDDEN');
    }

    await prisma.board.update({
        where: { id: boardId },
        data: {
            isDeleted: false,
            deletedAt: null
        },
    });
};

/**
 * ✅ 5. PERMANENTLY DELETE BOARD
 */
export const permanentlyDeleteBoardRepository = async (
    boardId: string,
    userId: string
): Promise<void> => {
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: { 
            ownerId: true,
            thumbnailPublicId: true 
        }
    });

    if (!board) {
        throw new AppError('BOARD_NOT_FOUND');
    }

    if (board.ownerId !== userId) {
        throw new AppError('FORBIDDEN');
    }

    // Delete thumbnail from Cloudinary
    if (board.thumbnailPublicId) {
        try {
            await cloudinary.uploader.destroy(board.thumbnailPublicId);
        } catch (error) {
            console.error('Cloudinary delete error:', error);
        }
    }

    // Delete from database
    await prisma.board.delete({
        where: { id: boardId },
    });
};

/**
 * ✅ 6. SHARE BOARD (Add Collaborator)
 */
export const shareBoardRepository = async (
    boardId: string,
    userId: string,
    data: ShareBoardDTO
): Promise<void> => {
    const board = await prisma.board.findUnique({
        where: { id: boardId },
        select: { 
            ownerId: true, 
            title: true,        // ✅ thêm
        }
    });

    if (!board) throw new AppError('BOARD_NOT_FOUND');
    if (board.ownerId !== userId) throw new AppError('FORBIDDEN');

    // Find sender info
    const sender = await prisma.user.findUnique({  // ✅ thêm
        where: { id: userId },
        select: { username: true, displayName: true }
    });

    // Find target user
    const targetUser = await prisma.user.findUnique({
        where: { email: data.userEmail },
        select: { id: true, username: true, displayName: true }  // ✅ thêm select
    });

    if (!targetUser) throw new AppError('USER_NOT_FOUND');

    // Upsert collaborator
    const existing = await prisma.boardCollaborator.findUnique({
        where: { boardId_userId: { boardId, userId: targetUser.id } }
    });

    if (existing) {
        await prisma.boardCollaborator.update({
            where: { boardId_userId: { boardId, userId: targetUser.id } },
            data: { role: data.role }
        });
    } else {
        await prisma.boardCollaborator.create({
            data: {
                boardId,
                userId: targetUser.id,
                role: data.role,
                acceptedAt: new Date()
            }
        });
    }

    // ✅ Gửi email thông báo (non-blocking — không throw nếu email lỗi)
    sendShareBoardEmail({
        recipientEmail: data.userEmail,
        recipientName: targetUser.displayName || targetUser.username || 'there',
        senderName: sender?.displayName || sender?.username || 'Someone',
        boardTitle: board.title,
        boardId,
        role: data.role,
        appUrl: ENV.REDIRECT.FRONTEND_URL || 'http://localhost:5173',
    }).catch((err) => {
        console.error('⚠️ Failed to send share email (non-critical):', err.message);
    });
};

/**
 * ✅ 7. GET DELETED BOARDS (Trash)
 */
export const getDeletedBoardsRepository = async (
    userId: string,
    page: number = 1,
    limit: number = 8
): Promise<ListBoardsResponse> => {
    console.log('get deleted')
    const skip = (page - 1) * limit;

    const [whiteboards, total] = await Promise.all([
        prisma.board.findMany({
            where: {
                ownerId: userId,
                isDeleted: true
            },
            select: {
                id: true,
                title: true,
                description: true,
                isPublic: true,
                isFavorite: true,
                type: true,
                thumbnailUrl: true,
                deletedAt: true,
                createdAt: true,
                updatedAt: true,
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
            },
            orderBy: {
                deletedAt: 'desc',
            },
            skip,
            take: limit,
        }),
        prisma.board.count({
            where: {
                ownerId: userId,
                isDeleted: true
            },
        }),
    ]);

    return { whiteboards, total, page, limit };
};

/**
 * ✅ 8. DOWNLOAD BOARD DATA
 */
export const downloadBoardDataRepository = async (
    boardId: string,
    userId: string
) => {
    const access = await checkAccess(boardId, userId);
    if (!access.hasAccess) {
        throw new AppError('FORBIDDEN');
    }

    const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            owner: {
                select: {
                    username: true,
                    displayName: true
                }
            },
            collaborators: {
                include: {
                    user: {
                        select: {
                            username: true,
                            displayName: true
                        }
                    }
                }
            }
        }
    });

    return board;
};

/**
 * ✅ 9. GET BOARDS OWNED BY USER
 */
export const getOwnedBoardsRepository = async (
    userId: string,
    page: number = 1,
    limit: number = 8
): Promise<ListBoardsResponse> => {
    const skip = (page - 1) * limit;

    const [whiteboards, total] = await Promise.all([
        prisma.board.findMany({
            where: {
                ownerId: userId,
                isDeleted: false  // Exclude deleted boards
            },
            select: {
                id: true,
                title: true,
                description: true,
                isPublic: true,
                isFavorite: true,
                type: true,
                thumbnailUrl: true,
                createdAt: true,
                updatedAt: true,
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                collaborators: {
                    select: {
                        id: true,
                        role: true,
                        invitedAt: true,
                        acceptedAt: true,
                        user: {
                            select: {
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
            skip,
            take: limit,
        }),
        prisma.board.count({
            where: {
                ownerId: userId,
                isDeleted: false
            },
        }),
    ]);

    return { whiteboards, total, page, limit };
};

/**
 * ✅ 10. GET BOARDS SHARED WITH USER
 */
export const getSharedBoardsRepository = async (
    userId: string,
    page: number = 1,
    limit: number = 8
): Promise<ListBoardsResponse> => {
    const skip = (page - 1) * limit;

    const [whiteboards, total] = await Promise.all([
        prisma.board.findMany({
            where: {
                isDeleted: false,
                // Only boards where user is a collaborator (NOT owner)
                collaborators: {
                    some: {
                        userId: userId,
                    },
                },
                // Exclude boards owned by this user
                NOT: {
                    ownerId: userId
                }
            },
            select: {
                id: true,
                title: true,
                description: true,
                isPublic: true,
                isFavorite: true,
                type: true,
                thumbnailUrl: true,
                createdAt: true,
                updatedAt: true,
                owner: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                    },
                },
                collaborators: {
                    select: {
                        id: true,
                        role: true,
                        invitedAt: true,
                        acceptedAt: true,
                        user: {
                            select: {
                                username: true,
                                displayName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
            skip,
            take: limit,
        }),
        prisma.board.count({
            where: {
                isDeleted: false,
                collaborators: {
                    some: {
                        userId: userId,
                    },
                },
                NOT: {
                    ownerId: userId
                }
            },
        }),
    ]);

    return { whiteboards, total, page, limit };
};