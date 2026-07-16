// C:\Users\Admin\Desktop\sexp\model\reel.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Check if we should skip model registration during build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
    !process.env.MONGODB_URI;

// Define the schemas
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

// Create the model or return mock during build
let ReelModel;

if (isBuildTime) {
    console.log('⚠️ Build time - using mock Reel model');
    // Create a mock model for build time
    ReelModel = {
        find: () => ({
            sort: () => ({
                skip: () => ({
                    limit: () => ({
                        populate: () => ({ exec: () => [] })
                    })
                })
            }),
            exec: () => []
        }),
        findById: () => ({
            exec: () => null,
            populate: () => ({ exec: () => null })
        }),
        findOne: () => ({ exec: () => null }),
        countDocuments: () => ({ exec: () => 0 }),
        create: (data) => data,
        save: () => ({}),
        deleteOne: () => ({}),
        deleteMany: () => ({}),
        updateOne: () => ({}),
        updateMany: () => ({}),
    };
} else {
    ReelModel = mongoose.models.Reel || model("Reel", ReelSchema);
}

export default ReelModel;