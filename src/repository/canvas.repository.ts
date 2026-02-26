
import { getDB } from '../config/mongo.js';
import { Stroke, Snapshot, BatchStrokes, DeleteStrokes, MoveStrokes, HistoryOperation, StrokeBatchDocument, DeletedStrokesDocument } from '../types/socket/canvas.type.js';

// ✅ Type-safe history operations



export const canvasRepository = {
    // Save batch of strokes
    async saveBatch(batch: BatchStrokes): Promise<void> {
        const db = getDB();

        await db.collection('strokes').insertOne({
            whiteboardId: batch.whiteboardId,
            strokes: batch.strokes,
            batchId: batch.batchId,
            timestamp: batch.timestamp,
            createdAt: Date.now(),
        });

        // ✅ Record draw operation in history (for undo)
        const strokeIds = batch.strokes.map(s => s.id);
        const userId = batch.strokes[0]?.userId || 'unknown';

        await db.collection<HistoryOperation>('stroke_history').insertOne({
            whiteboardId: batch.whiteboardId,
            type: 'draw',
            userId,
            addedStrokeIds: strokeIds,
            addedStrokes: batch.strokes,
            timestamp: batch.timestamp,
            undone: false,
        });
    },


    // Get all strokes for a whiteboard
    async getStrokes(whiteboardId: string): Promise<Stroke[]> {
        const db = getDB();

        const batches = await db
            .collection('strokes')
            .find({ whiteboardId: whiteboardId })
            .sort({ timestamp: 1 })
            .toArray();

        // Flatten all batches into single stroke array
        const strokes: Stroke[] = [];
        for (const batch of batches) {
            strokes.push(...batch.strokes);
        }

        return strokes;
    },


    // Create snapshot
    /**
     * Create snapshot
     */
    async createSnapshot(snapshot: Snapshot): Promise<void> {
        const db = getDB();

        // Filter out deleted strokes from snapshot
        const deletedIds = await this.getDeletedStrokeIds(snapshot.whiteboardId);
        const activeStrokes = snapshot.strokes.filter(
            s => !deletedIds.includes(s.id)
        );

        await db.collection('snapshots').insertOne({
            whiteboardId: snapshot.whiteboardId,
            strokes: activeStrokes,
            version: snapshot.version,
            createdAt: snapshot.createdAt,
            createdBy: snapshot.createdBy,
        });

        // Keep only last 5 snapshots per whiteboard
        const allSnapshots = await db
            .collection('snapshots')
            .find({ whiteboardId: snapshot.whiteboardId })
            .sort({ createdAt: -1 })
            .toArray();

        if (allSnapshots.length > 5) {
            const toDelete = allSnapshots.slice(5).map(s => s._id);
            await db.collection('snapshots').deleteMany({
                _id: { $in: toDelete }
            });
        }

        console.log(`Created snapshot with ${activeStrokes.length} active strokes (filtered ${deletedIds.length} deleted)`);
    },



    // Get latest snapshot
    async getLatestSnapshot(whiteboardId: string): Promise<Snapshot | null> {
        const db = getDB();

        const snapshot = await db
            .collection('snapshots')
            .findOne(
                { whiteboardId: whiteboardId },
                { sort: { createdAt: -1 } }
            );

        return snapshot as Snapshot | null;
    },

    // ========== UNDO/REDO OPERATIONS ==========

    /**
     * ✅ Undo last operation for a user
     */
    async undo(whiteboardId: string, userId: string): Promise<HistoryOperation | null> {
        const db = getDB();

        // Find last undoable operation by this user
        const lastOp = await db
            .collection<HistoryOperation>('stroke_history')
            .findOne(
                {
                    whiteboardId,
                    userId,
                    undone: { $ne: true }
                },
                { sort: { timestamp: -1 } }
            );

        if (!lastOp) {
            console.log('No operation to undo');
            return null;
        }

        // Perform undo based on operation type
        switch (lastOp.type) {
            case 'draw':
                // Undo draw = delete the strokes
                if (lastOp.addedStrokeIds && lastOp.addedStrokeIds.length > 0) {
                    await this.deleteStrokes({
                        whiteboardId,
                        strokeIds: lastOp.addedStrokeIds,
                        deletedBy: userId,
                        timestamp: Date.now(),
                    });
                }
                break;

            case 'delete':
                // Undo delete = restore the strokes
                if (lastOp.deletedStrokes && lastOp.deletedStrokes.length > 0) {
                    await this.restoreStrokesFromData(
                        whiteboardId,
                        lastOp.deletedStrokes
                    );
                }
                break;

            case 'move':
                // Undo move = restore previous positions
                if (lastOp.updates) {
                    const revertUpdates = lastOp.updates.map(u => ({
                        strokeId: u.strokeId,
                        points: u.previousPoints || []
                    }));

                    await this.moveStrokes({
                        whiteboardId,
                        updates: revertUpdates,
                        movedBy: userId,
                        timestamp: Date.now(),
                    });
                }
                break;
        }

        // Mark operation as undone
        await db.collection('stroke_history').updateOne(
            { _id: lastOp._id },
            { $set: { undone: true } }
        );

        console.log(`✅ Undone operation: ${lastOp.type} for user ${userId}`);
        return lastOp;
    },

    /**
     * ✅ Redo last undone operation for a user
     */
    async redo(whiteboardId: string, userId: string): Promise<HistoryOperation | null> {
        const db = getDB();

        // Find last undone operation by this user
        const lastUndone = await db
            .collection<HistoryOperation>('stroke_history')
            .findOne(
                {
                    whiteboardId,
                    userId,
                    undone: true,
                    redone: { $ne: true }
                },
                { sort: { timestamp: -1 } }
            );

        if (!lastUndone) {
            console.log('No operation to redo');
            return null;
        }

        // Perform redo based on operation type
        switch (lastUndone.type) {
            case 'draw':
                // Redo draw = restore the strokes
                if (lastUndone.addedStrokes && lastUndone.addedStrokes.length > 0) {
                    await this.restoreStrokesFromData(
                        whiteboardId,
                        lastUndone.addedStrokes
                    );
                }
                break;

            case 'delete':
                // Redo delete = delete again
                if (lastUndone.deletedStrokeIds) {
                    await this.deleteStrokes({
                        whiteboardId,
                        strokeIds: lastUndone.deletedStrokeIds,
                        deletedBy: userId,
                        timestamp: Date.now(),
                    });
                }
                break;

            case 'move':
                // Redo move = apply the move again
                if (lastUndone.updates) {
                    const redoUpdates = lastUndone.updates.map(u => ({
                        strokeId: u.strokeId,
                        points: u.points
                    }));

                    await this.moveStrokes({
                        whiteboardId,
                        updates: redoUpdates,
                        movedBy: userId,
                        timestamp: Date.now(),
                    });
                }
                break;
        }

        // Mark operation as redone (and no longer undone)
        await db.collection('stroke_history').updateOne(
            { _id: lastUndone._id },
            { $set: { undone: false, redone: true } }
        );

        console.log(`✅ Redone operation: ${lastUndone.type} for user ${userId}`);
        return lastUndone;
    },


    async restoreStrokesFromData(
        whiteboardId: string,
        strokes: Stroke[]
    ): Promise<void> {
        const db = getDB();

        // Add strokes back to a new batch
        const batch: BatchStrokes = {
            whiteboardId,
            strokes,
            batchId: `restore_${Date.now()}`,
            timestamp: Date.now(),
        };

        await this.saveBatch(batch);

        // Remove from deleted_strokes
        const strokeIds = strokes.map(s => s.id);
        await db.collection('deleted_strokes').deleteMany({
            whiteboardId,
            strokeIds: { $in: strokeIds }
        });

        console.log(`Restored ${strokes.length} strokes from data`);
    },

    /**
     * ✅ Get undo/redo stack status for a user
     */
    async getUndoRedoStatus(whiteboardId: string, userId: string): Promise<{
        canUndo: boolean;
        canRedo: boolean;
        undoCount: number;
        redoCount: number;
    }> {
        const db = getDB();

        const undoCount = await db
            .collection<HistoryOperation>('stroke_history')
            .countDocuments({
                whiteboardId,
                userId,
                undone: { $ne: true }
            });

        const redoCount = await db
            .collection<HistoryOperation>('stroke_history')
            .countDocuments({
                whiteboardId,
                userId,
                undone: true,
                redone: { $ne: true }
            });

        return {
            canUndo: undoCount > 0,
            canRedo: redoCount > 0,
            undoCount,
            redoCount
        };
    },


    /**
     * ✅ Get operation history (for undo/redo)
     */
    async getHistory(whiteboardId: string, limit: number = 50): Promise<HistoryOperation[]> {
        const db = getDB();

        const history = await db
            .collection<HistoryOperation>('stroke_history')
            .find({ whiteboardId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        return history;
    },


    async restoreStrokes(
        whiteboardId: string,
        strokeIds: string[],
        restoredBy: string
    ): Promise<void> {
        const db = getDB();

        // Remove from deleted_strokes
        await db.collection('deleted_strokes').deleteMany({
            whiteboardId,
            strokeIds: { $in: strokeIds }
        });

        // Record restore operation
        await db.collection<HistoryOperation>('stroke_history').insertOne({
            whiteboardId,
            type: 'restore',
            userId: restoredBy,
            strokeIds,
            restoredBy,
            timestamp: Date.now(),
        });

        console.log(`Restored ${strokeIds.length} strokes in whiteboard ${whiteboardId}`);
    },

    /**
     * ✅ Clean old history (keep last 30 days)
     */
    async cleanOldHistory(whiteboardId: string, daysToKeep: number = 30): Promise<void> {
        const db = getDB();
        const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

        await db.collection('stroke_history').deleteMany({
            whiteboardId,
            timestamp: { $lt: cutoffTime }
        });

        await db.collection('deleted_strokes').deleteMany({
            whiteboardId,
            deletedAt: { $lt: cutoffTime }
        });

        console.log(`Cleaned history older than ${daysToKeep} days for whiteboard ${whiteboardId}`);
    },

    // Get strokes since timestamp (for incremental loading)
    async getStrokesSince(
        whiteboardId: string,
        timestamp: number
    ): Promise<Stroke[]> {
        const db = getDB();

        const batches = await db
            .collection<StrokeBatchDocument>('strokes')
            .find({
                whiteboardId: whiteboardId,
                timestamp: { $gt: timestamp },
            })
            .sort({ timestamp: 1 })
            .toArray();

        const strokes: Stroke[] = [];
        for (const batch of batches) {
            strokes.push(...batch.strokes);
        }

        return strokes;
    },

    async deleteStrokes(deleteData: DeleteStrokes): Promise<Stroke[]> {
        const db = getDB();
        const batches = await db
            .collection<StrokeBatchDocument>('strokes')
            .find({ whiteboardId: deleteData.whiteboardId })
            .toArray();

        const deletedStrokes: Stroke[] = []

        // Update each batch
        for (const batch of batches) {
            const toDelete = batch.strokes.filter(
                stroke => deleteData.strokeIds.includes(stroke.id)
            );
            deletedStrokes.push(...toDelete);

            const filteredStrokes = batch.strokes.filter(
                stroke => !deleteData.strokeIds.includes(stroke.id)
            );

            // Only update if strokes were actually removed
            if (filteredStrokes.length !== batch.strokes.length) {
                await db.collection('strokes').updateOne(
                    { _id: batch._id },
                    { $set: { strokes: filteredStrokes } }
                );
            }
        }

        // 2. Record deletion with full stroke data (for undo)
        await db.collection('deleted_strokes').insertOne({
            whiteboardId: deleteData.whiteboardId,
            strokeIds: deleteData.strokeIds,
            deletedBy: deleteData.deletedBy,
            deletedAt: deleteData.timestamp,
            strokes: deletedStrokes, // ✅ Save full data
        });

        // 3. Record in history
        await db.collection<HistoryOperation>('stroke_history').insertOne({
            whiteboardId: deleteData.whiteboardId,
            type: 'delete',
            userId: deleteData.deletedBy,
            deletedStrokeIds: deleteData.strokeIds,
            deletedStrokes: deletedStrokes,
            timestamp: deleteData.timestamp,
            undone: false,
        });

        console.log(`Deleted ${deleteData.strokeIds.length} strokes from whiteboard ${deleteData.whiteboardId}`);
        return deletedStrokes;
    },

    async getDeletedStrokeIds(whiteboardId: string): Promise<string[]> {
        const db = getDB();

        const deletions = await db
            .collection<DeletedStrokesDocument>('deleted_strokes')
            .find({ whiteboardId })
            .toArray();

        const deletedIds = new Set<string>();
        deletions.forEach(deletion => {
            deletion.strokeIds.forEach(id => deletedIds.add(id));
        });

        return Array.from(deletedIds);
    },

    async moveStrokes(moveData: MoveStrokes): Promise<void> {
        const db = getDB();

        // Create a map for quick lookup
        const updateMap = new Map(
            moveData.updates.map(u => [u.strokeId, u.points])
        );

        // Store previous points for undo
        const previousPoints: Array<{ strokeId: string; points: number[]; previousPoints: number[] }> = [];

        // Update each batch that contains these strokes
        const batches = await db
            .collection<StrokeBatchDocument>('strokes')
            .find({
                whiteboardId: moveData.whiteboardId,
                'strokes.id': { $in: Array.from(updateMap.keys()) }
            })
            .toArray();

        for (const batch of batches) {
            let modified = false;
            const updatedStrokes = batch.strokes.map((stroke: Stroke) => {
                const newPoints = updateMap.get(stroke.id);
                if (newPoints) {
                    modified = true;
                    // Save previous state
                    previousPoints.push({
                        strokeId: stroke.id,
                        points: newPoints,
                        previousPoints: [...stroke.points]
                    });
                    return { ...stroke, points: newPoints };
                }
                return stroke;
            });

            if (modified) {
                await db.collection('strokes').updateOne(
                    { _id: batch._id },
                    { $set: { strokes: updatedStrokes } }
                );
            }
        }

        // Record the move operation (for undo/history)
        await db.collection<HistoryOperation>('stroke_history').insertOne({
            whiteboardId: moveData.whiteboardId,
            type: 'move',
            userId: moveData.movedBy,
            updates: previousPoints,
            movedBy: moveData.movedBy,
            timestamp: moveData.timestamp,
            undone: false
        });

        console.log(`Moved ${moveData.updates.length} strokes in whiteboard ${moveData.whiteboardId}`);
    },
};
