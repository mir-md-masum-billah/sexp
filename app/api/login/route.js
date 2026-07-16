// C:\Users\Admin\Desktop\sexp\app\api\login\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        console.log('🔑 Login API called');
        
        // Connect to MongoDB
        const db = await connectDB();
        if (!db) {
            console.error('❌ Database connection failed');
            return NextResponse.json(
                { message: 'Database connection failed' },
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

        const { username, password } = await request.json();

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

        // Compare password
        let isValid = false;
        try {
            // Check if password is hashed
            if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
                isValid = await bcrypt.compare(password, user.password);
            } else {
                // Plain text password (for backward compatibility)
                isValid = (user.password === password);
                // If valid, hash the password for future
                if (isValid) {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    user.password = hashedPassword;
                    await user.save();
                    console.log('✅ Password upgraded to hash for user:', username);
                }
            }
        } catch (compareError) {
            console.error('❌ Error comparing passwords:', compareError);
            return NextResponse.json(
                { message: 'Authentication error' },
                { status: 500 }
            );
        }

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
        console.error('❌ Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}