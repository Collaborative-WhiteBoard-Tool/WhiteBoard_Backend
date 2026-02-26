import { BoardRole } from "../../generated/prisma/enums.js";

export interface BoardResponse {
    id: string
    title: string
    description: string | null
    isPublic: boolean
    isFavorite?: boolean  
    isDeleted?: boolean  
    deletedAt?: Date  
    type: string | null
    createdAt: Date
    updatedAt: Date
    owner: {
        username: string | null;
        displayName: string | null
    };
    collaborators: {
        id: string;
        role: BoardRole;
        invitedAt: Date
        acceptedAt: Date | null
        user: {
            username: string | null;
            displayName: string | null
        };
    }[]
}


export interface ListBoardsResponse {
    whiteboards: BoardListItem[]
    collaborators?: CollaboratorResponse[];
    total: number
    page: number
    limit: number
}

export interface BoardListItem {
    id: string
    title: string
    description: string | null
    isPublic: boolean
    isFavorite?: boolean 
    isDeleted?: boolean 
    type: string | null
    owner: {
        id: string;
        username: string| null;
        displayName: string | null
    };
    createdAt: Date
    updatedAt: Date
}

export interface CollaboratorResponse {
    id: string;
    role: BoardRole;
    invitedAt: Date
    acceptedAt: Date | null
    user: {
        username: string | null;
        displayName: string | null
    };
}