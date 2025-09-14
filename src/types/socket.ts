import { drawSegmentSchema } from "../schemas/segmentSchema";
import { z } from "zod";
import { drawEventSchema } from "../schemas/boardSchema";

// Mỗi điểm vẽ
export type DrawPoint = {
    x: number;  // normalized [0..1] theo width
    y: number;  // normalized [0..1] theo height
};

// Một đoạn vẽ nhỏ (line segment)
export type DrawSegment = {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    color: string;
    width: number;
    strokeId: string; // định danh nét vẽ (1 nét có nhiều segment)
};

// Payload khi client gửi "draw" (trong lúc kéo chuột)
export type DrawEvent = z.infer<typeof drawEventSchema>

// Payload khi client gửi "drawEnd" (khi thả chuột, kết thúc 1 stroke)
export type DrawEndEvent = {
    boardId: string;
    userId: string;
    strokeId: string;    // nét nào vừa xong
};

// Payload khi client clear board
export type ClearEvent = {
    boardId: string;
    userId: string;
};

export type { drawSegmentSchema };