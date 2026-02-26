
// Socket events
export enum SocketEvents {
    // Client -> Server
    JOIN_WHITEBOARD = 'join_whiteboard',
    LEAVE_WHITEBOARD = 'leave_whiteboard',
    DRAW_STROKE = 'draw_stroke',
    DRAW_BATCH = 'draw_batch',
    CURSOR_MOVE = 'cursor_move',
    REQUEST_SNAPSHOT = 'request_snapshot',
    BATCH_CONFIRMED = 'batch_confirmed',
    DELETE_STROKES = 'delete_strokes',
    STROKES_DELETED = 'strokes_deleted',
    TRANSFORM_STROKES = 'transform_strokes',
    STROKES_TRANSFORMED = 'strokes_transformed',

    // Selection & Move
    MOVE_STROKES = 'move_strokes',
    SELECTION_CHANGED = 'selection_changed',
    STROKES_MOVED = 'strokes_moved',

    // Server -> Client
    WHITEBOARD_STATE = 'whiteboard_state',
    STROKE_DRAWN = 'stroke_drawn',
    BATCH_DRAWN = 'batch_drawn',
    USER_JOINED = 'user_joined',
    USER_LEFT = 'user_left',
    CURSOR_MOVED = 'cursor_moved',
    SNAPSHOT_CREATED = 'snapshot_created',
    ERROR = 'error',
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',


    // ✅ Undo/Redo
    UNDO = 'undo',
    REDO = 'redo',
    UNDO_COMPLETED = 'undo_completed',
    REDO_COMPLETED = 'redo_completed',
    HISTORY_UPDATED = 'history_updated',
}
