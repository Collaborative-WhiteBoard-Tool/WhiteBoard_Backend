import { getDB } from "../config/mongo.js"
import { MONGO_COLLECTION } from "../constants/mongo.collection.js"
import { Stroke_1 } from "../models/Stroke.js"

export const insertStroke = async (stroke: Stroke_1) => {
  const db = getDB()
  return await db.collection(MONGO_COLLECTION.STROKES).insertOne(stroke)
}

export const getStrokesByBoard = async (boardId: string) => {
  const db = getDB()
  return await db
    .collection(MONGO_COLLECTION.STROKES)
    .find({ boardId, isDeleted: { $ne: true } })
    .sort({ createdAt: 1 })
    .toArray()
}

export const undoLastStroke = async (boardId: string, userId: string) => {
  const db = getDB()

  const last = await db.collection("strokes").findOne(
    { boardId, userId, isDeleted: { $ne: true } },
    { sort: { createdAt: -1 } }
  )

  if (!last) return null

  await db.collection("strokes").updateOne(
    { _id: last._id },
    { $set: { isDeleted: true } }
  )

  return last._id
}
