import prisma from "../config/prisma.js"
import { CreateNewBoardDTO } from "../schemas/boardSchema.js"
import { WhiteboardResponse } from "../types/whiteboard.type.js"

export const createBoardRepository = async (ownerId: string, payload: CreateNewBoardDTO): Promise<WhiteboardResponse> => {
    const board = await prisma.board.create({
        data: {
            title: payload.title,
            type: payload.type,
            ownerId,
            data: {},
        },
        include: {
            owner: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                    displayName: true
                }
            },
            collaborators: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            displayName: true
                        }
                    }
                }
            }
        }
    })
    return board as WhiteboardResponse
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


export const getBoardByIdRepository = async (boardId: string): Promise<WhiteboardResponse> => {
    const whiteboard = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
            owner: {
                select: {
                    id: true,
                    email: true,
                    username: true,
                    displayName: true
                }
            },
            collaborators: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                            displayName: true
                        }
                    }
                }
            }
        }
    })
    return whiteboard as WhiteboardResponse
}


export const getUserWhiteboardsRepository = async (
    userId?: string,
    page: number = 1,
    limit: number = 8
) => {
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
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        displayName: true,
                    },
                },
                collaborators: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
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