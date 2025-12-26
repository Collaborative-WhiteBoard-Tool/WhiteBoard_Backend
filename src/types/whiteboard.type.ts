import { BoardRole } from "../../generated/prisma/enums.js";

export interface BoardListItem {
    id: string
    title: string
    description: string | null
    isPublic: boolean
    ownerId: string
    type: string | null
    createdAt: Date
    updatedAt: Date
}

export interface ListBoardsResponse {
    boards: BoardListItem[]
    total: number
    page: number
    limit: number
    totalPages: number
}


export interface WhiteboardResponse {
    id: string;
    title: string;
    description: string | null;
    ownerId: string;
    owner: {
        id: string;
        username: string;
        email: string;
        displayName: string
    };
    data: any;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    collaborators?: CollaboratorResponse[];
}


export interface CollaboratorResponse {
    id: string;
    userId: string;
    role: BoardRole;
    invitedAt: Date
    acceptedAt: Date | null
    user: {
        id: string;
        username: string;
        email: string;
        displayName: string
    };
}