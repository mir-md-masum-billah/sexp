// C:\Users\Admin\Desktop\sexp\app\api\login\route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/model/user';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        // Connect to MongoDB
        if (!mongoose.connections[0].readyState) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const { username, password } = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Compare password (using bcrypt if you have it installed)
        // For now, we'll do a simple comparison
        // In production, use: const isValid = await bcrypt.compare(password, user.password);
        const isValid = (user.password === password);

        if (!isValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Return user data without password
        const userData = {
            id: user._id,
            name: user.name,
            username: user.username,
            profilepic: user.profilepic || '',
            createAt: user.createAt,
        };

        return NextResponse.json({
            message: 'Login successful',
            user: userData
        }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optional: Add GET method if needed
export async function GET() {
    return NextResponse.json(
        { message: 'Login API endpoint' },
        { status: 200 }
    );
}