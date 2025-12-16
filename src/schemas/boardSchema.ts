    import {z} from "zod";

    export const createBoardSchema = z.object({
        title: z.string().min(1, "Title is required"),
        owner: z.string().min(1, "Owner is required"),
    })


    export const updateBoardSchema = z.object({
        title: z.string().min(1, "Title is required").optional(),
        owner: z.string().min(1, "Owner is required").optional(),
    })