import { Stroke_1 } from "../models/Stroke.js";
import { getStrokesByBoard, insertStroke, undoLastStroke } from "../repository/stroke.repository.js";

// ======================
export const createStroke = async (data: Stroke_1) => {
  return insertStroke({
    ...data,
    createdAt: new Date(),
    isDeleted: false
  })
}

export const loadBoard = async (boardId: string) => {
  try {
    const getAll = await getStrokesByBoard(boardId)
    console.log(getAll)
    return getAll
  } catch (error) {
    console.log(error)
  }
}

export const undoStroke = async (boardId: string, userId: string) => {
  return undoLastStroke(boardId, userId)
}