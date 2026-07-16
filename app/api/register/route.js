// C:\Users\Admin\Desktop\sexp\app\api\register\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/model/user';

export async function POST(request) {
    try {
        console.log('📝 Register API called');

        // Check if User model is available
        if (!User) {
            console.error('❌ User model is not available');
            return NextResponse.json(
                { message: 'Server configuration error: User model not found' },
                { status: 500 }
            );
        }

        // Connect to MongoDB
        const db = await connectDB();
        if (!db) {
            console.error('❌ Database connection failed');
            return NextResponse.json(
                { message: 'Database connection failed. Please try again later.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { name, username, password, profilepic } = body;

        console.log('📝 Register attempt for username:', username);

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
        try {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return NextResponse.json(
                    { message: 'Username already exists' },
                    { status: 409 }
                );
            }
        } catch (findError) {
            console.error('❌ Error finding user:', findError);
            return NextResponse.json(
                { message: 'Database error while checking username' },
                { status: 500 }
            );
        }

        // Create new user
        try {
            const newUser = new User({
                name: name || username,
                username,
                password, // Will be hashed automatically
                profilepic: profilepic || '',
            });

            await newUser.save();
            console.log('✅ User created successfully:', username);

            // Return user data without password
            const userData = {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                profilepic: newUser.profilepic,
                createAt: newUser.createAt,
            };

            return NextResponse.json({
                message: 'User created successfully',
                user: userData
            }, { status: 201 });

        } catch (saveError) {
            console.error('❌ Error saving user:', saveError);
            return NextResponse.json(
                { message: 'Error creating user: ' + saveError.message },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('❌ Registration error:', error);
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