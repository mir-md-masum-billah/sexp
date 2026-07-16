// C:\Users\Admin\Desktop\sexp\lib\db.js
import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    // If we already have a connection, return it
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI_CLOUDFLARE;
    
    console.log('🔍 Checking MongoDB URI...');
    console.log('🔑 MONGODB_URI exists:', !!mongoUri);
    console.log('🔑 MONGODB_URI length:', mongoUri ? mongoUri.length : 0);
    
    // During build time or if no URI, return null without error
    if (!mongoUri) {
        console.warn('⚠️ MONGODB_URI is not defined');
        return null;
    }

    // Check if we're in a build environment
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('⚠️ Build time - skipping database connection');
        return null;
    }

    // If we already have a connection, use it
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            // Add these for better compatibility
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        console.log('🔄 Connecting to MongoDB...');
        cached.promise = mongoose.connect(mongoUri, opts)
            .then((mongoose) => {
                console.log('✅ Connected to MongoDB');
                return mongoose;
            })
            .catch((error) => {
                console.error('❌ MongoDB connection error:', error.message);
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
    return cached.conn !== null && mongoose.connection.readyState === 1;
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