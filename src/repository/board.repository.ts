import prisma from "../config/prisma.js"
import { CreateNewBoardDTO } from "../schemas/boardSchema.js"
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
                type: true,
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