// C:\Users\Admin\Desktop\sexp\model\reel.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CommentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: true }); // Ensure comments have _id

const ReelSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    userProfilepic: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.models.Reel || model("Reel", ReelSchema);