import {z} from "zod";

export const createBoardDto = z.object({
    title: z.string().min(1, "Title is required"),
    owner: z.string().optional(),
})

export type CreateBoardDtoType = z.infer<typeof createBoardDto>;