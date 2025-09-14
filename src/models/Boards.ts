import mongoose, {Schema, Document} from "mongoose";
export interface IBoard extends Document {
    title: string;
    owner: string;
    created_at: Date;
    updated_at: Date;
}

const BoardSchema : Schema = new Schema({
    title: {type : String, required: true},
    owner: {type : String, required: false},
}, {timestamps: true});

export default mongoose.model<IBoard>("Board", BoardSchema);