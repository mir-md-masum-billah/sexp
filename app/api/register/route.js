// C:\Users\Admin\Desktop\sexp\app\api\register\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request) {
    try {
        console.log('📝 Register API called');
        
        // Connect to MongoDB
        const db = await connectDB();
        if (!db) {
            console.error('❌ Database connection failed');
            return NextResponse.json(
                { message: 'Database connection failed. Please try again later.' },
                { status: 503 }
            );
        }

        // Import User model
        const User = (await import('@/model/user')).default;
        
        if (!User) {
            console.error('❌ User model is not available');
            return NextResponse.json(
                { message: 'Server configuration error' },
                { status: 500 }
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
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json(
                { message: 'Username already exists' },
                { status: 409 }
            );
        }

        // NOTE: password is left as plain text here on purpose.
        // The pre('save') hook in model/user.js hashes it automatically.
        // Hashing it here too would double-hash it and break login.
        const userData = {
            name: name || username,
            username,
            password,
            profilepic: profilepic || '',
            followers: [],
            following: [],
            bio: '',
        };

        const newUser = new User(userData);
        await newUser.save();
        
        console.log('✅ User created successfully:', username);

        // Return user data without password
        const userResponse = {
            id: newUser._id,
            name: newUser.name,
            username: newUser.username,
            profilepic: newUser.profilepic,
            createAt: newUser.createAt,
        };

        return NextResponse.json({ 
            message: 'User created successfully',
            user: userResponse
        }, { status: 201 });
        
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