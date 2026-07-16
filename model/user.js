// C:\Users\Admin\Desktop\sexp\model\user.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

// Check if we should skip model registration during build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    !process.env.MONGODB_URI;

// Define the schema
const UserSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    profilepic: { type: String, default: '/default-avatar.png' },
    bio: { type: String, default: '' },
    password: { type: String, required: true },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create the model or return mock during build
let UserModel;

if (isBuildTime) {
    console.log('⚠️ Build time - using mock User model');
    // Create a mock model for build time
    UserModel = {
        find: () => ({ 
            exec: () => [], 
            sort: () => ({ exec: () => [] }),
            skip: () => ({ limit: () => ({ exec: () => [], populate: () => ({ exec: () => [] }) }) })
        }),
        findOne: () => ({ exec: () => null }),
        findById: () => ({ 
            exec: () => null, 
            select: () => ({ exec: () => null }),
            populate: () => ({ exec: () => null })
        }),
        create: (data) => data,
        save: () => ({}),
        countDocuments: () => ({ exec: () => 0 }),
        deleteOne: () => ({}),
        deleteMany: () => ({}),
        updateOne: () => ({}),
        updateMany: () => ({}),
    };
} else {
    UserModel = mongoose.models.User || model("User", UserSchema);
}

export default UserModel;