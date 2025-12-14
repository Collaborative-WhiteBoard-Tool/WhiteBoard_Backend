import Boards from "../models/Boards";
import * as strokeService from "../services/strokeService";

export const createBoard = async (title: string, owner?: string) => {
    const board = new Boards({title, owner});
    return await board.save();
};

export const updateBoard = async (boardId: string, data: Partial<{title: string, owner: string}> ) => {
    return await Boards.findByIdAndUpdate(boardId, data, {new: true});
}

export const getBoardId = async (id: string) => {
    return await Boards.findById(id);
}

    export const getBoardWithStrokes = async (boardid: string) => {
    const board = await Boards.findById(boardid);
    if(!board) return null;
    // giả sử bạn có strokes service
    const  strokes = await strokeService.getStrokeByBoard(boardid);
    return {board, strokes};
}