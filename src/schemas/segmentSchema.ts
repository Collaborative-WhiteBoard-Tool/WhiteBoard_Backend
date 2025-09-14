import { z } from "zod";

export const drawSegmentSchema = z.object({
    boardId: z.string(),
    strokeId: z.string(),
    x: z.number(),
    y: z.number(),
    pressure: z.number().optional(),
});

export type DrawSegment = z.infer<typeof drawSegmentSchema>;
