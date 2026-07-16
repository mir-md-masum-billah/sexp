// C:\Users\Admin\Desktop\sexp\app\api\reels\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
    try {
        // During build time, return empty data
        if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.MONGODB_URI) {
            return NextResponse.json({
                reels: [],
                pagination: { page: 1, limit: 10, total: 0, pages: 0 }
            }, { status: 200 });
        }

        // Import models dynamically
        const { default: Reel } = await import('@/model/reel');
        const { default: User } = await import('@/model/user');

        const db = await connectDB();
        if (!db) {
            return NextResponse.json({
                reels: [],
                pagination: { page: 1, limit: 10, total: 0, pages: 0 }
            }, { status: 200 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        const sort = searchParams.get('sort') || 'latest';
        const search = searchParams.get('search') || '';
        const following = searchParams.get('following') === 'true';

        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        if (following) {
            const session = await getServerSession(authOptions);
            if (!session) {
                return NextResponse.json(
                    { message: 'Unauthorized' },
                    { status: 401 }
                );
            }
            const user = await User.findById(session.user.id);
            if (user && user.following && user.following.length > 0) {
                query.userId = { $in: user.following };
            } else {
                return NextResponse.json({
                    reels: [],
                    pagination: { page, limit, total: 0, pages: 0 }
                }, { status: 200 });
            }
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') {
            sortOption = { likes: -1, views: -1 };
        }

        const reels = await Reel.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username name profilepic');

        const total = await Reel.countDocuments(query);

        return NextResponse.json({
            reels,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching reels:', error);
        return NextResponse.json(
            { message: 'Error fetching reels: ' + error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        // During build time, return error
        if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.MONGODB_URI) {
            return NextResponse.json(
                { message: 'API not available during build' },
                { status: 503 }
            );
        }

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { default: Reel } = await import('@/model/reel');

        const db = await connectDB();
        if (!db) {
            return NextResponse.json(
                { message: 'Database connection failed' },
                { status: 503 }
            );
        }

        const { title, description, videoUrl, thumbnail } = await request.json();

        if (!title || !videoUrl) {
            return NextResponse.json(
                { message: 'Title and video URL are required' },
                { status: 400 }
            );
        }

        const reel = new Reel({
            title,
            description: description || '',
            videoUrl,
            thumbnail: thumbnail || '',
            userId: session.user.id,
            username: session.user.username,
            userProfilepic: session.user.profilepic || '',
        });

        await reel.save();

        return NextResponse.json({
            message: 'Reel created successfully',
            reel
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating reel:', error);
        return NextResponse.json(
            { message: 'Error creating reel: ' + error.message },
            { status: 500 }
        );
    }
}