import { z } from "zod";


const pointSchema = z.object({
    x: z.number(),
    y: z.number(),
    pressure: z.number().optional(),
});

export const drawSegmentSchema = z.object({
    boardId: z.string(),
    userId: z.string(),
    strokeId: z.string(),
    tool: z.enum(["pen", "eraser", "highlighter", "brush", "shape", "text", "laser"]),
    path: z.array(pointSchema).min(1),
    color: z.string().optional(),
    thickness: z.number().optional(),
    opacity: z.number().optional(),
});

export type DrawSegment = z.infer<typeof drawSegmentSchema>;
