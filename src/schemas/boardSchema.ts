import { z } from "zod";
import { BoardTypeEnum } from "../constants/BoardTypeEnum.js";


export const BoardDBSchema = z.object({
    id: z.string().cuid(),
    title: z.string().min(3).max(100),
    description: z.string().max(500).nullable(),
    isPublic: z.boolean(),
    ownerId: z.string(),
    type: z.string().nullable(),

    // Whiteboard data (canvas, shapes, paths...)
    data: z.record(z.string(), z.any()),

    thumbnailUrl: z.string().url().nullable().optional(),
    thumbnailPublicId: z.string().nullable().optional(),
    thumbnailUpdatedAt: z.date().nullable().optional(),

    createdAt: z.date(),
    updatedAt: z.date(),
});




export const createNewBoardSchema = z.object({
    title: z
        .string()
        .optional()
        .default("Untitled WhiteBoard"),

    type: BoardTypeEnum
        .optional()
        .default("whiteboard")
}).strict()



// export const updateBoardSchema = z.object({
//     title: z.string().min(1, "Title is required").optional(),
//     owner: z.string().min(1, "Owner is required").optional(),
// })



export const updateThumbnailSchema = z.object({
    thumbnailUrl: z.string().url(),
    thumbnailPublicId: z.string(),
}).strict();


export const updateBoardTitleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
});

export const toggleFavoriteSchema = z.object({
  isFavorite: z.boolean(),
});

export const shareBoardSchema = z.object({
  userEmail: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"]),
});


export type UpdateThumbnailDTO = z.infer<typeof updateThumbnailSchema>;
export type CreateNewBoardDTO = z.infer<typeof createNewBoardSchema>
export type BoardDB = z.infer<typeof BoardDBSchema>;
export type UpdateBoardTitleDTO = z.infer<typeof updateBoardTitleSchema>;
export type ToggleFavoriteDTO = z.infer<typeof toggleFavoriteSchema>;
export type ShareBoardDTO = z.infer<typeof shareBoardSchema>;