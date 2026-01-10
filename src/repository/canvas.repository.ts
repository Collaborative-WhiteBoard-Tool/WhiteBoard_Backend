
import { getDB } from '../config/mongo.js';
import { Stroke, Snapshot, BatchStrokes } from '../types/socket/canvas.type.js';

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
    async createSnapshot(snapshot: Snapshot): Promise<void> {
        const db = getDB();

        await db.collection('snapshots').insertOne({
            whiteboardId: snapshot.whiteboardId,
            strokes: snapshot.strokes,
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

    // Get strokes since timestamp (for incremental loading)
    async getStrokesSince(
        whiteboardId: string,
        timestamp: number
    ): Promise<Stroke[]> {
        const db = getDB();

        const batches = await db
            .collection('strokes')
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
};
