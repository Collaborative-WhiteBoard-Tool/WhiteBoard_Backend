import Stroke, {IStroke} from "../models/Stroke";
import mongoose, {Types} from "mongoose";

export const saveStroke = async (strokeData : Partial<IStroke>) => {
    const stroke = new Stroke(strokeData);
    return await stroke.save();
}

export const getStrokeByBoard = async (boardId : string | Types.ObjectId) => {
    const id = typeof boardId === "string" ? new mongoose.Types.ObjectId(boardId) : boardId;
    return await Stroke.find({ boardId: id, deleted: false}).sort({timestamp: 1})
}

export const clearBoardStrokes = async (boardId : Types.ObjectId) => {
    return await Stroke.deleteMany({boardId});
}