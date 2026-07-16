import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/model/user';
import Reel from '@/model/reel';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request, { params }) {
    try {
        await connectDB();
        
        // ✅ Unwrap params Promise
        const { id } = await params;
        
        const user = await User.findById(id)
            .select('-password');
        
        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Get user's reels
        const reels = await Reel.find({ userId: id })
            .sort({ createdAt: -1 });

        const session = await getServerSession(authOptions);
        let isFollowing = false;
        
        if (session) {
            const currentUser = await User.findById(session.user.id);
            isFollowing = currentUser.following.includes(id);
        }

        return NextResponse.json({
            user,
            reels,
            stats: {
                reelsCount: reels.length,
                followers: user.followers.length,
                following: user.following.length
            },
            isFollowing
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { message: 'Error fetching user' },
            { status: 500 }
        );
    }
}

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
        
        // ✅ Unwrap params Promise
        const { id } = await params;
        
        const targetUser = await User.findById(id);
        const currentUser = await User.findById(session.user.id);

        if (!targetUser || !currentUser) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        if (id === session.user.id) {
            return NextResponse.json(
                { message: 'Cannot follow yourself' },
                { status: 400 }
            );
        }

        const followIndex = currentUser.following.indexOf(id);

        if (followIndex > -1) {
            // Unfollow
            currentUser.following.splice(followIndex, 1);
            targetUser.followers.splice(targetUser.followers.indexOf(session.user.id), 1);
            await currentUser.save();
            await targetUser.save();
            return NextResponse.json({ 
                message: 'Unfollowed', 
                following: false 
            }, { status: 200 });
        } else {
            // Follow
            currentUser.following.push(id);
            targetUser.followers.push(session.user.id);
            await currentUser.save();
            await targetUser.save();
            return NextResponse.json({ 
                message: 'Followed', 
                following: true 
            }, { status: 200 });
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        return NextResponse.json(
            { message: 'Error toggling follow' },
            { status: 500 }
        );
    }
}