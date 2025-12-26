import { z } from "zod";
import { BoardTypeEnum } from "../constants/BoardTypeEnum.js";

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

export type CreateNewBoardDTO = z.infer<typeof createNewBoardSchema>