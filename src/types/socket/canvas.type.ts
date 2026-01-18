import { z } from 'zod';

// Stroke validation schema
export const StrokeSchema = z.object({
    id: z.string(),
    type: z.enum(['pen', 'eraser', 'line', 'rectangle', 'circle', 'text']),
    points: z.array(z.number()),
    color: z.string(),
    width: z.number().min(1).max(50),
    timestamp: z.number(),
    userId: z.string(),
    username: z.string().optional(),
});


export type Stroke = z.infer<typeof StrokeSchema>;

// Batch strokes for performance
export const BatchStrokesSchema = z.object({
    whiteboardId: z.string(),
    strokes: z.array(StrokeSchema),
    batchId: z.string(),
    timestamp: z.number(),
});

export type BatchStrokes = z.infer<typeof BatchStrokesSchema>;

// Snapshot for state recovery
export const SnapshotSchema = z.object({
    whiteboardId: z.string(),
    strokes: z.array(StrokeSchema),
    version: z.number(),
    createdAt: z.number(),
    createdBy: z.string(),
});

export type Snapshot = z.infer<typeof SnapshotSchema>;

// Cursor position
export const CursorSchema = z.object({
    userId: z.string(),
    username: z.string(),
    x: z.number(),
    y: z.number(),
    color: z.string(),
    timestamp: z.number(),
});

export type Cursor = z.infer<typeof CursorSchema>;

// User presence
export interface UserPresence {
    userId: string;
    userName: string;
    displayName: string;
    socketId: string;
    color: string;
    lastSeen: number;
}

// Rate limiting config
export interface RateLimitConfig {
    maxStrokesPerSecond: number;
    maxStrokesPerMinute: number;
    burstAllowance: number;
}
