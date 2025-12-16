import mongoose, {Schema, Document} from "mongoose";
import {ObjectId} from "mongodb";


export interface Ipoint {
    x: number;
    y: number;
    pressure?: number;
}

export interface IStroke extends Document {
    boardId: string;
    userId?: string;
    strokeId: string;
    tool: "pen" | "eraser" | "highlighter" | "brush" | "shape" | "text" | "laser";
    path?: Ipoint[];
    shapeData?: {
        type: "rectangle" | "circle" | "line";
        x: number;
        y: number;
        width: number;
        height: number;
    }
    textContent?: string;
    color?: string;
    thickness?: number;
    opacity?: number;
    layer?: number;
    createdAt: Date;
    updatedAt: Date;
}


const StrokeSchema : Schema = new Schema({
    boardId : {type: Schema.Types.ObjectId, ref: "Board", required: true},
    userId : {type: String, required: false},
    strokeId : {type: String, required: true, unique: true},
    tool : {
        type: String,
        enum: ["pen", "eraser", "highlighter", "brush", "shape", "text", "laser"],
        default: "pen"
    },
    path: [{ x: Number, y: Number, pressure: Number }],
    shapeData: {
        type: {
            type: String,
            enum: ["rectangle", "circle", "line"],
            default: "rectangle"
        },
        x: Number,
        y: Number,
        width: Number,
        height: Number,
    },
    textContent: {type: String},
    color: {type: String, default: "#000000"},
    thickness: {type: Number, default: 2},
    opacity: {type: Number, default: 1},
    layer: {type: Number, default: 0},
}, {timestamps: true});


export interface Point {
  x: number
  y: number
}

export interface Stroke_new {
  boardId: string
  userId: string
  tool: "pen" | "eraser" | "line"
  color: string
  width: number
  points: Point[]
  createdAt: Date
}
//===============================================
export interface Point {
  x: number
  y: number
}

export interface Stroke_1 {
  _id?: ObjectId
  boardId: string
  userId: string
  points: Point[]
  color: string
  width: number
  createdAt: Date
  isDeleted?: boolean
}


export default mongoose.model<IStroke>("Stroke", StrokeSchema)

