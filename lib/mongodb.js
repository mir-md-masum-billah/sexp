// C:\Users\Admin\Desktop\sexp\lib\mongodb.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

// Check if we're in a build environment or no URI
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || !uri;

let client;
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
    // Normal MongoDB client
    if (process.env.NODE_ENV === "development") {
        if (!global._mongoClientPromise) {
            client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect();
        }
        clientPromise = global._mongoClientPromise;
    } else {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }
}

export default clientPromise;