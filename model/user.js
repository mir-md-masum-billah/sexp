// C:\Users\Admin\Desktop\sexp\model\user.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema, model } = mongoose;

// Check if we're in a build environment
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || !process.env.MONGODB_URI;

// Only define the schema if we're not in build time
let UserModel;

if (isBuildTime) {
    console.log('⚠️ Build time - using mock User model');
    // Create a simple mock that mimics the model interface
    UserModel = function (data) {
        this._doc = data || {};
        this.save = async () => this;
    };
    UserModel.findOne = async (query) => null;
    UserModel.findById = async (id) => null;
    UserModel.find = async (query) => [];
    UserModel.countDocuments = async (query) => 0;
    UserModel.create = async (data) => data;
    UserModel.deleteOne = async () => ({ deletedCount: 0 });
    UserModel.updateOne = async () => ({ modifiedCount: 0 });
} else {
    try {
        // Check if model already exists
        if (mongoose.models.User) {
            UserModel = mongoose.models.User;
        } else {
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
            UserSchema.pre('save', async function () {
                if (!this.isModified('password')) return;

                const salt = await bcrypt.genSalt(10);
                this.password = await bcrypt.hash(this.password, salt);
                // next() লাগবে না — async ফাংশন হওয়ায় Mongoose নিজেই
                // Promise resolve/reject দেখে hook শেষ হয়েছে নাকি error হয়েছে বুঝে নেয়।
            });

            // Compare password method
            UserSchema.methods.comparePassword = async function (candidatePassword) {
                return await bcrypt.compare(candidatePassword, this.password);
            };

            // Create the model
            UserModel = model("User", UserSchema);
        }
    } catch (error) {
        console.error('❌ Error creating User model:', error);
        // Fallback to existing model if available
        UserModel = mongoose.models.User || null;
    }
}

export default UserModel;