// C:\Users\Admin\Desktop\sexp\app\api\test-db\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/model/user';

export async function GET() {
    try {
        const results = {
            env: {
                NODE_ENV: process.env.NODE_ENV,
                MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Not set',
                MONGODB_URI_LENGTH: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
                NEXT_PHASE: process.env.NEXT_PHASE || 'Not set',
            },
            models: {
                User: typeof User,
                User_functions: User ? Object.keys(User).filter(k => typeof User[k] === 'function') : [],
            },
            connection: {
                attempt: false,
                success: false,
                error: null,
                readyState: null,
            }
        };

        // Try to connect
        try {
            results.connection.attempt = true;
            const db = await connectDB();
            results.connection.success = !!db;
            results.connection.readyState = db ? 'connected' : 'disconnected';

            if (db) {
                // Try to count users
                try {
                    const count = await User.countDocuments();
                    results.userCount = count;
                } catch (countError) {
                    results.userCountError = countError.message;
                }
            }
        } catch (connError) {
            results.connection.error = connError.message;
            results.connection.stack = connError.stack;
        }

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}