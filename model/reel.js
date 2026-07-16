// C:\Users\Admin\Desktop\sexp\model\reel.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Check if we're in a build environment
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// Define schemas
const CommentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

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

// Export the model
let ReelModel;

// During build time, return a lightweight mock
if (isBuildTime || !process.env.MONGODB_URI) {
    console.log('⚠️ Build time - using mock Reel model');
    ReelModel = function(data) {
        this._doc = data || {};
        this.save = async () => this;
        this.populate = () => this;
    };
    ReelModel.find = async (query) => [];
    ReelModel.findById = async (id) => null;
    ReelModel.countDocuments = async (query) => 0;
    ReelModel.create = async (data) => data;
    ReelModel.deleteOne = async () => ({ deletedCount: 0 });
    ReelModel.updateOne = async () => ({ modifiedCount: 0 });
} else {
    try {
        ReelModel = mongoose.models.Reel || model("Reel", ReelSchema);
    } catch (error) {
        console.error('❌ Error creating Reel model:', error);
        ReelModel = mongoose.models.Reel;
    }
}

export default ReelModel;