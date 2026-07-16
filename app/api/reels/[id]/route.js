// C:\Users\Admin\Desktop\sexp\app\api\reels\[id]\route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Reel from '@/model/reel';
import User from '@/model/user'; // Add if needed
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const reel = await Reel.findById(id)
            .populate('userId', 'username name profilepic');

        if (!reel) {
            return NextResponse.json(
                { message: 'Reel not found' },
                { status: 404 }
            );
        }

        // Increment views
        reel.views += 1;
        await reel.save();

        return NextResponse.json({ reel }, { status: 200 });
    } catch (error) {
        console.error('Error fetching reel:', error);
        return NextResponse.json(
            { message: 'Error fetching reel' },
            { status: 500 }
        );
    }
}

// POST like/unlike reel
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const { id } = await params;

        const reel = await Reel.findById(id);

        if (!reel) {
            return NextResponse.json(
                { message: 'Reel not found' },
                { status: 404 }
            );
        }

        const userId = session.user.id;
        const likeIndex = reel.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Unlike
            reel.likes.splice(likeIndex, 1);
            await reel.save();
            return NextResponse.json({
                message: 'Unliked',
                likes: reel.likes.length,
                liked: false
            }, { status: 200 });
        } else {
            // Like
            reel.likes.push(userId);
            await reel.save();
            return NextResponse.json({
                message: 'Liked',
                likes: reel.likes.length,
                liked: true
            }, { status: 200 });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json(
            { message: 'Error toggling like' },
            { status: 500 }
        );
    }
}

// POST comment on reel
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const { id } = await params;
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { message: 'Comment text is required' },
                { status: 400 }
            );
        }

        const reel = await Reel.findById(id);

        if (!reel) {
            return NextResponse.json(
                { message: 'Reel not found' },
                { status: 404 }
            );
        }

        reel.comments.push({
            userId: session.user.id,
            username: session.user.username,
            text
        });

        await reel.save();

        return NextResponse.json({
            message: 'Comment added',
            comments: reel.comments
        }, { status: 200 });
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json(
            { message: 'Error adding comment' },
            { status: 500 }
        );
    }
}

// DELETE reel
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const { id } = await params;

        const reel = await Reel.findById(id);

        if (!reel) {
            return NextResponse.json(
                { message: 'Reel not found' },
                { status: 404 }
            );
        }

        // Check if user owns the reel
        if (reel.userId.toString() !== session.user.id) {
            return NextResponse.json(
                { message: 'Unauthorized to delete this reel' },
                { status: 403 }
            );
        }

        await reel.deleteOne();

        return NextResponse.json({
            message: 'Reel deleted successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting reel:', error);
        return NextResponse.json(
            { message: 'Error deleting reel' },
            { status: 500 }
        );
    }
}