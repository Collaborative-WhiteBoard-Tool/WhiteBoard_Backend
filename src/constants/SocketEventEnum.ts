
// Socket events
export enum SocketEvents {
    // Client -> Server
    JOIN_WHITEBOARD = 'join_whiteboard',
    LEAVE_WHITEBOARD = 'leave_whiteboard',
    DRAW_STROKE = 'draw_stroke',
    DRAW_BATCH = 'draw_batch',
    CURSOR_MOVE = 'cursor_move',
    REQUEST_SNAPSHOT = 'request_snapshot',

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
}
