// C:\Users\Admin\Desktop\sexp\lib\mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Check if we're in a build environment or no URI
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || !uri;

let clientPromise;

if (isBuildTime) {
    // During build time, create a mock client
    console.warn('⚠️ Build time or no MONGODB_URI - using mock MongoDB client');

    const mockDb = {
        collection: () => ({
            find: () => ({ toArray: () => [] }),
            findOne: () => null,
            insertOne: () => ({ insertedId: 'mock-id' }),
            updateOne: () => ({ modifiedCount: 0 }),
            deleteOne: () => ({ deletedCount: 0 }),
            countDocuments: () => 0,
        }),
        command: () => ({}),
    };

    const mockClient = {
        db: () => mockDb,
        connect: () => Promise.resolve(mockClient),
        close: () => Promise.resolve(),
    };

    clientPromise = Promise.resolve(mockClient);
} else {
    // Always reuse a cached client + connection promise, in every environment.
    // Without this, a brand new MongoClient (and a brand new TCP connection)
    // gets created on every single request in production, which quickly
    // exhausts Atlas connection limits and causes the login timeouts.
    if (!global._mongoClientPromise) {
        const client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect()
            .then((client) => {
                console.log('✅ MongoClient connected (cached)');
                return client;
            })
            .catch((error) => {
                console.error('❌ MongoClient connection error:', error.message);
                global._mongoClientPromise = null;
                throw error;
            });
    }
    clientPromise = global._mongoClientPromise;
}

export default clientPromise;