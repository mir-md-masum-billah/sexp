// C:\Users\Admin\Desktop\sexp\app\api\register\route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/model/user';

export async function POST(request) {
    try {
        // Connect to MongoDB
        if (!mongoose.connections[0].readyState) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const { name, username, password, profilepic } = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json(
                { message: 'Username already exists' },
                { status: 409 }
            );
        }

        // Create new user (password will be hashed by the model's pre-save hook)
        const newUser = new User({
            name: name || username,
            username,
            password, // Will be hashed automatically
            profilepic: profilepic || '',
        });

        await newUser.save();

        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                profilepic: newUser.profilepic,
                createAt: newUser.createAt,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { message: 'Register API endpoint' },
        { status: 200 }
    );
}