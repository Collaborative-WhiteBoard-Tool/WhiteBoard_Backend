import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { PresenceService } from "../services/presence.service.js";
import { RateLimitService } from "../services/rateLimit.service.js";
import { BatchStrokesSchema, CursorSchema, DeleteStrokesSchema, MoveStrokesSchema, SelectionSchema, Stroke, StrokeSchema, UndoRedoSchema, UserPresence } from "../types/socket/canvas.type.js";
import { AuthSocketPayload } from "../types/socket/authSocket.type.js"
import { SocketEvents } from "../constants/SocketEventEnum.js"
import { verifyAccessToken } from "../utils/auth.js"
import { BatchStrokes } from "../types/socket/canvas.type.js"
import { getRedisPublisher, getRedisSubscriber } from "../config/redis.js"
import { createAdapter } from '@socket.io/redis-adapter';
import { checkAccess, incrementVersion } from "../repository/board.repository.js";
import { ZodError } from "zod";
import { canvasRepository } from "../repository/canvas.repository.js";
import cookie from 'cookie';
import { findUserPublicById } from "../repository/auth.repository.js";
import AppError from "../utils/appError.js";

export class SocketManager {
    private io: SocketServer;
    private presenceService: PresenceService;
    private rateLimitService: RateLimitService;

    // Batch buffer for strokes (reduces DB writes)
    private strokeBuffer: Map<string, Stroke[]> = new Map();
    private flushInterval?: NodeJS.Timeout;

    // Snapshot interval (every 5 minutes or 1000 strokes)
    private snapshotInterval?: NodeJS.Timeout;
    private strokeCountSinceSnapshot: Map<string, number> = new Map();

    constructor(server: HttpServer) {
        // Initialize Socket.IO server
        this.io = new SocketServer(server, {
            cors: {
                origin: process.env.URL_CLIENT?.split(',').map(url => url.trim()) || ['http://localhost:5173'],
                credentials: true,
            },
            // Performance settings
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        this.presenceService = new PresenceService();
        this.rateLimitService = new RateLimitService();

        this.setupRedisAdapter();
        this.setupMiddleware();
        this.setupEventHandlers();
        this.startBackgroundTasks();

        console.log('✅ Socket.IO Manager initialized');
    }

    // ============================================================================
    // SETUP METHODS
    // ============================================================================

    /**
     * Setup Redis adapter for multi-server support
     */
    private setupRedisAdapter(): void {
        try {
            const pubClient = getRedisPublisher();
            const subClient = getRedisSubscriber();

            this.io.adapter(createAdapter(pubClient, subClient));
            console.log('✅ Socket.IO Redis adapter configured');
        } catch (error) {
            console.error('❌ Failed to setup Redis adapter:', error);
            throw error;
        }
    }

    /**
     * Setup authentication middleware
     */
    private setupMiddleware(): void {
        console.log('🛠️ [DEBUG] setupMiddleware is being called')
        this.io.use(async (socket: AuthSocketPayload, next) => {
            console.log('🔍 [DEBUG] Middleware triggered by a connection attempt!');
            try {
                // 1. Lấy chuỗi Cookie thô từ headers
                const rawCookies = socket.handshake.headers.cookie;

                if (!rawCookies) {
                    console.error('❌ No cookies found in handshake');
                    return next(new Error('Authentication required'));
                }

                // 2. Parse chuỗi cookie thành object
                const parsedCookies = cookie.parse(rawCookies);

                // 3. Lấy token (thay 'accessToken' bằng tên cookie bạn đặt ở backend)
                const token = parsedCookies.accessToken;

                if (!token) {
                    console.error('❌ Access token not found in cookies');
                    return next(new Error('Authentication required'));
                }

                // 4. Verify JWT token
                const payload = verifyAccessToken(token);

                if (!payload) {
                    return next(new Error('Invalid token payload'));
                }
                const user = await findUserPublicById(payload.id)
                if (!user) {
                    return next(new AppError("USER_NOT_FOUND"))
                }
                // Gán thông tin vào socket để dùng ở các event sau
                socket.userId = payload.id;

                socket.userName = user.username ?? undefined
                socket.displayName = user.displayName

                console.log(`✅ Socket authenticated via Cookie: ${socket.id}, User: ${socket.userId}, ${socket.displayName}`);
                next();
            } catch (error) {
                console.error('⚠️ Socket authentication error:', error);
                next(new Error('Invalid token'));
            }
        });
    }

    /**
     * Setup all Socket.IO event handlers
     */
    private setupEventHandlers(): void {
        this.io.on('connection', (socket: AuthSocketPayload) => {
            console.log(`✅ Socket connected: ${socket.id}, User: ${socket.userId}`);

            // Join whiteboard room
            socket.on(
                SocketEvents.JOIN_WHITEBOARD,
                async (data: { whiteboardId: string }) => {
                    await this.handleJoinWhiteboard(socket, data.whiteboardId);
                }
            );

            // Leave whiteboard room
            socket.on(SocketEvents.LEAVE_WHITEBOARD, async () => {
                await this.handleLeaveWhiteboard(socket);
            });

            // Draw single stroke
            socket.on(SocketEvents.DRAW_STROKE, async (data: unknown) => {
                await this.handleDrawStroke(socket, data);
            });

            // Draw batch of strokes (recommended for performance)
            socket.on(SocketEvents.DRAW_BATCH, async (data: unknown) => {
                await this.handleDrawBatch(socket, data);
            });

            // Cursor movement
            socket.on(SocketEvents.CURSOR_MOVE, async (data: unknown) => {
                await this.handleCursorMove(socket, data);
            });

            // Request snapshot (for new users or recovery)
            socket.on(SocketEvents.REQUEST_SNAPSHOT, async () => {
                await this.handleRequestSnapshot(socket);
            });

            socket.on(SocketEvents.DELETE_STROKES, async (data: unknown) => {
                await this.handleDeleteStrokes(socket, data);
            });

            socket.on(SocketEvents.MOVE_STROKES, async (data: unknown) => {
                await this.handleMoveStrokes(socket, data);
            });

            socket.on(SocketEvents.SELECTION_CHANGED, async (data: unknown) => {
                await this.handleSelectionChange(socket, data);
            });

            // ✅ Delete strokes
            socket.on(SocketEvents.DELETE_STROKES, async (data: unknown) => {
                await this.handleDeleteStrokes(socket, data);
            });

            // ✅ Move strokes (selection drag)
            socket.on(SocketEvents.MOVE_STROKES, async (data: unknown) => {
                await this.handleMoveStrokes(socket, data);
            });

            // ✅ Undo/Redo
            socket.on(SocketEvents.UNDO, async (data: unknown) => {
                await this.handleUndo(socket, data);
            });

            socket.on(SocketEvents.REDO, async (data: unknown) => {
                await this.handleRedo(socket, data);
            });

            // Disconnect
            socket.on('disconnect', async () => {
                await this.handleDisconnect(socket);
            });

            // Error handling
            socket.on('error', (error) => {
                console.error(`Socket error for ${socket.id}:`, error);
            });
        });
    }

    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================

    /**
     * Handle user joining a whiteboard
     */
    private async handleJoinWhiteboard(
        socket: AuthSocketPayload,
        whiteboardId: string
    ): Promise<void> {
        try {
            console.log(`User ${socket.userId} joining whiteboard ${whiteboardId}`);

            if (socket.whiteBoardId === whiteboardId) {
                return; // EARLY RETURN
            }
            // Check if user has access to this whiteboard
            const access = await checkAccess(whiteboardId, socket.userId!);

            if (!access.hasAccess) {
                socket.emit(SocketEvents.ERROR, {
                    message: 'Access denied to this whiteboard'
                });
                return;
            }

            // Leave previous whiteboard if any
            if (socket.whiteBoardId) {
                await this.handleLeaveWhiteboard(socket);
            }

            // Join the room
            if (socket.whiteBoardId !== whiteboardId) {
                socket.whiteBoardId = whiteboardId;
                await socket.join(whiteboardId);
            }

            const userColor = this.generateUserColor(socket.userId!)
            socket.color = userColor
            // Add user to presence
            const presence: UserPresence = {
                userId: socket.userId!,
                userName: socket.userName!,
                displayName: socket.displayName!,
                socketId: socket.id,
                color: userColor,
                lastSeen: Date.now(),
            };

            await this.presenceService.addUser(whiteboardId, presence);

            // Get current whiteboard state
            const snapshot = await canvasRepository.getLatestSnapshot(whiteboardId);
            const deletedIds = await canvasRepository.getDeletedStrokeIds(whiteboardId);

            let strokes: Stroke[];

            if (snapshot) {
                // Load snapshot + newer strokes (optimized)
                const newerStrokes = await canvasRepository.getStrokesSince(
                    whiteboardId,
                    snapshot.createdAt
                );
                strokes = [...snapshot.strokes, ...newerStrokes];
                console.log(
                    `Loaded snapshot (${snapshot.strokes.length}) + new strokes (${newerStrokes.length})`
                );
            } else {
                // Load all strokes (first time)
                strokes = await canvasRepository.getStrokes(whiteboardId);
                console.log(`Loaded all strokes (${strokes.length})`);
            }

            // Filter out deleted strokes
            const activeStrokes = strokes.filter(s => !deletedIds.includes(s.id));

            // Get online users
            const users = await this.presenceService.getUsers(whiteboardId);

            // Send current state to the user
            socket.emit(SocketEvents.WHITEBOARD_STATE, {
                strokes: activeStrokes,
                users,
            });

            // Notify others that user joined
            socket.to(whiteboardId).emit(SocketEvents.USER_JOINED, presence);

            console.log(
                `✅ User ${socket.userId, socket.color} joined whiteboard ${whiteboardId} (${users.length} users online)`
            );
        } catch (error) {
            console.error('Error joining whiteboard:', error);
            socket.emit(SocketEvents.ERROR, {
                message: 'Failed to join whiteboard'
            });
        }
    }

    /**
     * Handle user leaving a whiteboard
     */
    private async handleLeaveWhiteboard(socket: AuthSocketPayload): Promise<void> {
        if (!socket.whiteBoardId) return;

        try {
            const whiteboardId = socket.whiteBoardId;
            await this.presenceService.removeUser(whiteboardId, socket.userId!);

            socket.to(whiteboardId).emit(SocketEvents.USER_LEFT, {
                userId: socket.userId,
            });

            await socket.leave(whiteboardId);
            socket.whiteBoardId = undefined;

            console.log(`User ${socket.userId} left whiteboard ${whiteboardId}`);
        } catch (error) {
            console.error('Error leaving whiteboard:', error);
        }
    }

    /**
     * Handle drawing a single stroke
     */
    private async handleDrawStroke(socket: AuthSocketPayload, data: unknown): Promise<void> {
        if (!socket.whiteBoardId) {
            socket.emit(SocketEvents.ERROR, { message: 'Not in a whiteboard' });
            return;
        }

        try {
            if (typeof data !== 'object' || data === null) {
                socket.emit(SocketEvents.ERROR, { message: 'Invalid payload' });
                return;
            }

            const stroke = StrokeSchema.parse({
                ...(data as Record<string, unknown>),
                userId: socket.userId,
                username: socket.userName,
                displayname: socket.displayName ?? undefined,
                timestamp: Date.now(),
            });

            const allowed = await this.rateLimitService.checkRateLimit(
                socket.userId!,
                socket.whiteBoardId
            );

            if (!allowed) {
                socket.emit(SocketEvents.RATE_LIMIT_EXCEEDED, {
                    message: 'Drawing too fast. Please slow down.',
                });
                return;
            }

            const bufferId = socket.whiteBoardId;
            if (!this.strokeBuffer.has(bufferId)) {
                this.strokeBuffer.set(bufferId, []);
            }
            this.strokeBuffer.get(bufferId)!.push(stroke);

            socket.to(socket.whiteBoardId).emit(SocketEvents.STROKE_DRAWN, stroke);

            const count =
                (this.strokeCountSinceSnapshot.get(socket.whiteBoardId) || 0) + 1;
            this.strokeCountSinceSnapshot.set(socket.whiteBoardId, count);

            if (count >= 1000) {
                await this.createSnapshot(socket.whiteBoardId);
            }
        } catch (error) {
            if (error instanceof ZodError) {
                socket.emit(SocketEvents.ERROR, {
                    message: 'Invalid stroke data',
                    errors: error.message,
                });
            } else {
                console.error('Error handling stroke:', error);
                socket.emit(SocketEvents.ERROR, {
                    message: 'Failed to process stroke'
                });
            }
        }

    }

    /**
     * Handle drawing a batch of strokes (recommended for performance)
     */
    private async handleDrawBatch(socket: AuthSocketPayload, data: unknown): Promise<void> {
        if (!socket.whiteBoardId) {
            socket.emit(SocketEvents.ERROR, { message: 'Not in a whiteboard' });
            return;
        }

        try {
            if (typeof data !== 'object' || data === null) {
                socket.emit(SocketEvents.ERROR, { message: 'Invalid payload' });
                return;
            }

            const batch = BatchStrokesSchema.parse({
                ...(data as Record<string, unknown>),
                whiteboardId: socket.whiteBoardId,
                timestamp: Date.now(),
            });

            batch.strokes = batch.strokes.map((stroke) => ({
                ...stroke,
                userId: socket.userId!,
                username: socket.userName!,
                displayname: socket.displayName ?? undefined
            }));

            const allowed = await this.rateLimitService.checkRateLimit(
                socket.userId!,
                socket.whiteBoardId
            );

            if (!allowed) {
                socket.emit(SocketEvents.RATE_LIMIT_EXCEEDED, {
                    message: 'Drawing too fast. Please slow down.',
                });
                return;
            }

            await canvasRepository.saveBatch(batch);

            this.io.to(socket.whiteBoardId).emit(SocketEvents.BATCH_DRAWN, batch);
            socket.emit(SocketEvents.BATCH_CONFIRMED, { batchId: batch.batchId });

            const count =
                (this.strokeCountSinceSnapshot.get(socket.whiteBoardId) || 0) +
                batch.strokes.length;
            this.strokeCountSinceSnapshot.set(socket.whiteBoardId, count);

            if (count >= 1000) {
                await this.createSnapshot(socket.whiteBoardId);
            }

            console.log(
                `Batch saved: ${batch.strokes.length} strokes for whiteboard ${socket.whiteBoardId}`
            );
        } catch (error) {
            if (error instanceof ZodError) {
                socket.emit(SocketEvents.ERROR, {
                    message: 'Invalid batch data',
                    errors: error,
                });
            } else {
                console.error('Error handling batch:', error);
                socket.emit(SocketEvents.ERROR, {
                    message: 'Failed to process batch'
                });
            }
        }
    }

    // ✅ Handle delete strokes
    private async handleDeleteStrokes(socket: AuthSocketPayload, data: unknown): Promise<void> {
        if (!socket.whiteBoardId) {
            socket.emit(SocketEvents.ERROR, { message: 'Not in a whiteboard' });
            return;
        }

        try {
            if (typeof data !== 'object' || data === null) {
                socket.emit(SocketEvents.ERROR, { message: 'Invalid payload' });
                return;
            }

            const deleteData = DeleteStrokesSchema.parse({
                ...(data as Record<string, unknown>),
                whiteboardId: socket.whiteBoardId,
                deletedBy: socket.userId!,
                timestamp: Date.now(),
            });

            // Save deletion to database
            await canvasRepository.deleteStrokes(deleteData);

            // Broadcast to all users (including sender for confirmation)
            this.io.to(socket.whiteBoardId).emit(SocketEvents.STROKES_DELETED, {
                strokeIds: deleteData.strokeIds,
                deletedBy: deleteData.deletedBy,
            });

            console.log(
                `✅ Deleted ${deleteData.strokeIds.length} strokes by user ${socket.userId} in whiteboard ${socket.whiteBoardId}`
            );
        } catch (error) {
            if (error instanceof ZodError) {
                socket.emit(SocketEvents.ERROR, {
                    message: 'Invalid delete data',
                    errors: error.message,
                });
            } else {
                console.error('Error deleting strokes:', error);
                socket.emit(SocketEvents.ERROR, {
                    message: 'Failed to delete strokes'
                });
            }
        }
    }

    // ✅ Handle move strokes (selection drag)
    private async handleMoveStrokes(socket: AuthSocketPayload, data: unknown): Promise<void> {
        if (!socket.whiteBoardId) {
            socket.emit(SocketEvents.ERROR, { message: 'Not in a whiteboard' });
            return;
        }

        try {
            if (typeof data !== 'object' || data === null) {
                socket.emit(SocketEvents.ERROR, { message: 'Invalid payload' });
                return;
            }

            const moveData = MoveStrokesSchema.parse({
                ...(data as Record<string, unknown>),
                whiteboardId: socket.whiteBoardId,
                movedBy: socket.userId!,
                timestamp: Date.now(),
            });

            // Update strokes in database
            await canvasRepository.moveStrokes(moveData);

            // Broadcast to all users
            this.io.to(socket.whiteBoardId).emit(SocketEvents.STROKES_MOVED, {
                updates: moveData.updates,
                movedBy: moveData.movedBy,
            });

            console.log(
                `✅ Moved ${moveData.updates.length} strokes by user ${socket.userId} in whiteboard ${socket.whiteBoardId}`
            );
        } catch (error) {
            if (error instanceof ZodError) {
                socket.emit(SocketEvents.ERROR, {
                    message: 'Invalid move data',
                    errors: error.message,
                });
            } else {
                console.error('Error moving strokes:', error);
                socket.emit(SocketEvents.ERROR, {
                    message: 'Failed to move strokes'
                });
            }
        }
    }


    // ✅ Handle selection change (optional - for collaborative selection highlighting)
    private async handleSelectionChange(socket: AuthSocketPayload, data: unknown): Promise<void> {
        if (!socket.whiteBoardId) return;

        try {
            if (typeof data !== 'object' || data === null) {
                return;
            }

            const selection = SelectionSchema.parse({
                ...(data as Record<string, unknown>),
                userId: socket.userId!,
                username: socket.displayName,
                timestamp: Date.now(),
            });

            // Broadcast to others (ephemeral, not saved to DB)
            socket.to(socket.whiteBoardId).emit(SocketEvents.SELECTION_CHANGED, selection);
        } catch (error) {
            // Silently fail for selection (not critical)
            console.error('Error handling selection change:', error);
        }
    }

    /**
     * Handle cursor movement
     */
    private async handleCursorMove(socket: AuthSocketPayload, data: unknown): Promise<void> {
        if (!socket.whiteBoardId) return;

        try {
            if (typeof data !== 'object' || data === null) {
                return;
            }

            const cursor = CursorSchema.parse({
                ...(data as Record<string, unknown>),
                userId: socket.userId,
                username: socket.userName,
                displayname: socket.displayName ?? undefined,
                color: socket?.color,
                timestamp: Date.now(),
            });

            socket.to(socket.whiteBoardId).emit(SocketEvents.CURSOR_MOVED, cursor);

            await this.presenceService.heartbeat(
                socket.whiteBoardId,
                socket.userId!
            );
        } catch (error: unknown) {
            console.error('Error handling cursor move:', error);
        }
    }

    /**
     * Handle snapshot request
     */
    private async handleRequestSnapshot(socket: AuthSocketPayload): Promise<void> {
        if (!socket.whiteBoardId) return;

        try {
            const snapshot = await canvasRepository.getLatestSnapshot(
                socket.whiteBoardId
            );

            if (snapshot) {
                socket.emit(SocketEvents.SNAPSHOT_CREATED, snapshot);
            } else {
                socket.emit(SocketEvents.ERROR, {
                    message: 'No snapshot available'
                });
            }
        } catch (error) {
            console.error('Error requesting snapshot:', error);
            socket.emit(SocketEvents.ERROR, {
                message: 'Failed to get snapshot'
            });
        }
    }


    // ✅ Handle undo
    private async handleUndo(socket: AuthSocketPayload, data: unknown): Promise<void> {
        if (!socket.whiteBoardId) {
            socket.emit(SocketEvents.ERROR, { message: 'Not in a whiteboard' });
            return;
        }

        try {
            if (typeof data !== 'object' || data === null) {
                socket.emit(SocketEvents.ERROR, { message: 'Invalid payload' });
                return;
            }

            const undoAction = UndoRedoSchema.parse({
                ...(data as Record<string, unknown>),
                whiteboardId: socket.whiteBoardId,
                userId: socket.userId!,
                action: 'undo',
                timestamp: Date.now(),
            });

            // Perform undo
            const undoneOp = await canvasRepository.undo(
                undoAction.whiteboardId,
                undoAction.userId
            );

            if (!undoneOp) {
                socket.emit(SocketEvents.ERROR, {
                    message: 'Nothing to undo'
                });
                return;
            }

            // Get updated state
            const strokes = await canvasRepository.getStrokes(socket.whiteBoardId);
            const deletedIds = await canvasRepository.getDeletedStrokeIds(socket.whiteBoardId);
            const activeStrokes = strokes.filter(s => !deletedIds.includes(s.id));

            // Broadcast updated state to all users
            this.io.to(socket.whiteBoardId).emit(SocketEvents.UNDO_COMPLETED, {
                userId: socket.userId,
                operation: undoneOp.type,
                strokes: activeStrokes,
            });

            // Send undo/redo status to user
            const status = await canvasRepository.getUndoRedoStatus(
                socket.whiteBoardId,
                socket.userId!
            );

            socket.emit(SocketEvents.HISTORY_UPDATED, status);

            console.log(
                `✅ Undo completed: ${undoneOp.type} by user ${socket.userId} in whiteboard ${socket.whiteBoardId}`
            );
        } catch (error) {
            console.error('Error handling undo:', error);
            socket.emit(SocketEvents.ERROR, {
                message: 'Failed to undo operation'
            });
        }
    }

    // ✅ Handle redo
    private async handleRedo(socket: AuthSocketPayload, data: unknown): Promise<void> {
        if (!socket.whiteBoardId) {
            socket.emit(SocketEvents.ERROR, { message: 'Not in a whiteboard' });
            return;
        }

        try {
            if (typeof data !== 'object' || data === null) {
                socket.emit(SocketEvents.ERROR, { message: 'Invalid payload' });
                return;
            }

            const redoAction = UndoRedoSchema.parse({
                ...(data as Record<string, unknown>),
                whiteboardId: socket.whiteBoardId,
                userId: socket.userId!,
                action: 'redo',
                timestamp: Date.now(),
            });

            // Perform redo
            const redoneOp = await canvasRepository.redo(
                redoAction.whiteboardId,
                redoAction.userId
            );

            if (!redoneOp) {
                socket.emit(SocketEvents.ERROR, {
                    message: 'Nothing to redo'
                });
                return;
            }

            // Get updated state
            const strokes = await canvasRepository.getStrokes(socket.whiteBoardId);
            const deletedIds = await canvasRepository.getDeletedStrokeIds(socket.whiteBoardId);
            const activeStrokes = strokes.filter(s => !deletedIds.includes(s.id));

            // Broadcast updated state to all users
            this.io.to(socket.whiteBoardId).emit(SocketEvents.REDO_COMPLETED, {
                userId: socket.userId,
                operation: redoneOp.type,
                strokes: activeStrokes,
            });

            // Send undo/redo status to user
            const status = await canvasRepository.getUndoRedoStatus(
                socket.whiteBoardId,
                socket.userId!
            );

            socket.emit(SocketEvents.HISTORY_UPDATED, status);

            console.log(
                `✅ Redo completed: ${redoneOp.type} by user ${socket.userId} in whiteboard ${socket.whiteBoardId}`
            );
        } catch (error) {
            console.error('Error handling redo:', error);
            socket.emit(SocketEvents.ERROR, {
                message: 'Failed to redo operation'
            });
        }
    }

    /**
     * Handle socket disconnect
     */
    private async handleDisconnect(socket: AuthSocketPayload): Promise<void> {
        console.log(`❌ Socket disconnected: ${socket.id}, User: ${socket.userId}`);
        await this.handleLeaveWhiteboard(socket);
    }

    // ============================================================================
    // BACKGROUND TASKS
    // ============================================================================

    /**
     * Start all background tasks
     */
    private startBackgroundTasks(): void {
        // Flush stroke buffer every 2 seconds
        this.flushInterval = setInterval(() => {
            this.flushStrokeBuffer();
        }, 2000);

        // Create snapshots every 5 minutes
        this.snapshotInterval = setInterval(() => {
            this.createPeriodicSnapshots();
        }, 5 * 60 * 1000);

        // Clean stale users every 30 seconds
        setInterval(() => {
            this.cleanStaleUsers();
        }, 30000);

        console.log('✅ Background tasks started');
    }

    /**
     * Flush buffered strokes to database
     */
    private async flushStrokeBuffer(): Promise<void> {
        const entries = Array.from(this.strokeBuffer.entries());
        this.strokeBuffer.clear();

        for (const [whiteboardId, strokes] of entries) {
            if (strokes.length === 0) continue;

            try {
                const batch: BatchStrokes = {
                    whiteboardId,
                    strokes,
                    batchId: `batch_${Date.now()}_${Math.random()}`,
                    timestamp: Date.now(),
                };

                await canvasRepository.saveBatch(batch);
                console.log(
                    `Flushed ${strokes.length} strokes for whiteboard ${whiteboardId}`
                );
            } catch (error) {
                console.error(`Error flushing strokes for ${whiteboardId}:`, error);
            }
        }
    }

    /**
     * Create snapshots for active whiteboards
     */
    private async createPeriodicSnapshots(): Promise<void> {
        const activeWhiteboards = Array.from(
            this.strokeCountSinceSnapshot.keys()
        );

        for (const whiteboardId of activeWhiteboards) {
            const count = this.strokeCountSinceSnapshot.get(whiteboardId) || 0;

            // Create snapshot if significant activity (>100 strokes)
            if (count > 100) {
                await this.createSnapshot(whiteboardId);
            }
        }
    }

    /**
     * Clean stale users from all rooms
     */
    private async cleanStaleUsers(): Promise<void> {
        const rooms = this.io.sockets.adapter.rooms;

        for (const [roomId] of rooms) {
            // Skip socket.io internal rooms (they are socket IDs)
            if (roomId.length === 20) continue; // Socket IDs are 20 chars

            try {
                const staleUsers = await this.presenceService.cleanStaleUsers(
                    roomId,
                    60000 // 60 seconds
                );

                if (staleUsers.length > 0) {
                    this.io.to(roomId).emit(SocketEvents.USER_LEFT, {
                        userIds: staleUsers,
                    });
                    console.log(
                        `Cleaned ${staleUsers.length} stale users from ${roomId}`
                    );
                }
            } catch (error) {
                console.error(`Error cleaning stale users for ${roomId}:`, error);
            }
        }
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /**
     * Create a snapshot of whiteboard state
     */
    private async createSnapshot(whiteboardId: string): Promise<void> {
        try {
            console.log(`Creating snapshot for whiteboard ${whiteboardId}...`);

            const strokes = await canvasRepository.getStrokes(whiteboardId);
            const version = await incrementVersion(whiteboardId);

            await canvasRepository.createSnapshot({
                whiteboardId,
                strokes,
                version,
                createdAt: Date.now(),
                createdBy: 'system',
            });

            // Reset counter
            this.strokeCountSinceSnapshot.set(whiteboardId, 0);

            // Notify all users
            this.io.to(whiteboardId).emit(SocketEvents.SNAPSHOT_CREATED, {
                version,
                timestamp: Date.now(),
            });

            console.log(
                `✅ Snapshot created for whiteboard ${whiteboardId}, version ${version}, strokes: ${strokes.length}`
            );
        } catch (error) {
            console.error(
                `Error creating snapshot for ${whiteboardId}:`,
                error
            );
        }
    }

    /**
     * Generate a consistent color for a user
     */
    private generateUserColor(userId: string): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
            '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
            '#F8B739', '#52B788', '#E63946', '#457B9D',
        ];

        // Hash userId to get consistent color
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    }

    // ============================================================================
    // CLEANUP
    // ============================================================================

    /**
     * Cleanup on server shutdown
     */
    public async cleanup(): Promise<void> {
        console.log('🛑 Cleaning up Socket Manager...');

        // Stop background tasks
        clearInterval(this.flushInterval);
        clearInterval(this.snapshotInterval);

        // Flush remaining strokes
        await this.flushStrokeBuffer();

        // Close Socket.IO
        this.io.close();

        console.log('✅ Socket Manager cleaned up');
    }
}

// Export singleton instance creator
export const createSocketManager = (server: HttpServer): SocketManager => {
    return new SocketManager(server);
};