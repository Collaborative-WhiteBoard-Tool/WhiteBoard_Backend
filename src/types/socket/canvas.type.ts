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
    displayname: z.string().optional()
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


// ✅ DELETE STROKES
export const DeleteStrokesSchema = z.object({
    whiteboardId: z.string(),
    strokeIds: z.array(z.string()).min(1).max(100), // Max 100 strokes per delete
    deletedBy: z.string(),
    timestamp: z.number(),
});
export type DeleteStrokes = z.infer<typeof DeleteStrokesSchema>;

// ✅ MOVE/UPDATE STROKES (for selection drag)
export const MoveStrokesSchema = z.object({
    whiteboardId: z.string(),
    updates: z.array(z.object({
        strokeId: z.string(),
        points: z.array(z.number()), // New points after move
    })).min(1).max(50), // Max 50 strokes per move
    movedBy: z.string(),
    timestamp: z.number(),
});
export type MoveStrokes = z.infer<typeof MoveStrokesSchema>;

// ✅ SELECTION STATE (optional - for collaborative selection highlighting)
export const SelectionSchema = z.object({
    userId: z.string(),
    username: z.string().optional(),
    strokeIds: z.array(z.string()),
    bounds: z.object({
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
    }),
    timestamp: z.number(),
});
export type Selection = z.infer<typeof SelectionSchema>;


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
    displayname: z.string().optional(),
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


// Stroke batch document in MongoDB
export interface StrokeBatchDocument {
    _id?: unknown;
    whiteboardId: string;
    strokes: Stroke[];
    batchId: string;
    timestamp: number;
    createdAt: number;
}

// Deleted strokes tracking document
export interface DeletedStrokesDocument {
    _id?: unknown;
    whiteboardId: string;
    strokeIds: string[];
    deletedBy: string;
    deletedAt: number;
}

// History operation document (for undo/redo)
export interface HistoryOperation {
    _id?: unknown;
    whiteboardId: string;
    type: 'move' | 'restore' | 'delete' | 'draw';
    userId: string,
    // For move operations
    updates?: Array<{
        strokeId: string;
        points: number[];
        previousPoints?: number[];
    }>;

    // For delete operations
    deletedStrokeIds?: string[];
    deletedStrokes?: Stroke[];

    // For draw operations
    addedStrokeIds?: string[];
    addedStrokes?: Stroke[];

    // For restore operations
    restoredStrokeIds?: string[];

    // For restore/delete operations
    strokeIds?: string[];
    // User tracking
    movedBy?: string;
    restoredBy?: string;
    deletedBy?: string;
    timestamp: number;
    undone?: boolean;
    redone?: boolean;
}

// Snapshot document
export interface SnapshotDocument {
    _id?: unknown;
    whiteboardId: string;
    strokes: Stroke[];
    version: number;
    createdAt: number;
    createdBy: string;
}

export const UndoRedoSchema = z.object({
    whiteboardId: z.string(),
    userId: z.string(),
    action: z.enum(['undo', 'redo']),
    timestamp: z.number(),
});
export type UndoRedoAction = z.infer<typeof UndoRedoSchema>;