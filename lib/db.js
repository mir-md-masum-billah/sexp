// C:\Users\Admin\Desktop\sexp\lib\db.js
import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    // If we already have a connection, return it
    if (cached.conn) {
        return cached.conn;
    }

    // Check if MONGODB_URI is available
    const mongoUri = process.env.MONGODB_URI;
    
    // During build time or if no URI, return null without error
    if (!mongoUri) {
        console.warn('⚠️ MONGODB_URI is not defined - skipping database connection');
        return null;
    }

    // Check if we're in a build environment
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('⚠️ Build time - skipping database connection');
        return null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(mongoUri, opts)
            .then((mongoose) => {
                console.log('✅ Connected to MongoDB');
                return mongoose;
            })
            .catch((error) => {
                console.error('❌ MongoDB connection error:', error);
                cached.promise = null;
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Helper to check if database is connected
export function isDbConnected() {
    return cached.conn !== null;
}

// Helper to safely execute database operations
export async function withDb(fn, fallback = null) {
    try {
        const db = await connectDB();
        if (!db) {
            return fallback;
        }
        return await fn(db);
    } catch (error) {
        console.error('Database operation failed:', error);
        return fallback;
    }
}