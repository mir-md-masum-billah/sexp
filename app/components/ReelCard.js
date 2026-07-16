// C:\Users\Admin\Desktop\sexp\app\components\ReelCard.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

export default function ReelCard({ reel, onLike, onDelete }) {
    const [isLiked, setIsLiked] = useState(reel.likes?.includes(reel.userId?._id));
    const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState(reel.comments || []);

    const handleLike = async () => {
        try {
            const response = await fetch(`/api/reels/${reel._id}`, {
                method: 'POST',
            });
            const data = await response.json();
            if (response.ok) {
                setIsLiked(data.liked);
                setLikesCount(data.likes);
                if (onLike) onLike(reel._id, data.liked);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const response = await fetch(`/api/reels/${reel._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: comment })
            });
            const data = await response.json();
            if (response.ok) {
                setComments(data.comments);
                setComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this reel?')) {
            try {
                const response = await fetch(`/api/reels/${reel._id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    if (onDelete) onDelete(reel._id);
                }
            } catch (error) {
                console.error('Error deleting reel:', error);
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
            <div className="relative aspect-[9/16] bg-black">
                <video
                    src={reel.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                    poster={reel.thumbnail}
                />
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <Link href={`/profile/${reel.userId?._id}`} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                            {reel.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{reel.username}</p>
                            <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(reel.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600'
                                } hover:bg-red-50 transition-colors`}
                        >
                            <span>{isLiked ? '❤️' : '🤍'}</span>
                            <span>{likesCount}</span>
                        </button>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            💬 {comments.length}
                        </button>
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-red-500 hover:text-red-600 transition-colors"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="font-semibold">{reel.title}</h3>
                    {reel.description && (
                        <p className="text-sm text-gray-600">{reel.description}</p>
                    )}
                </div>

                // Update the comments section in ReelCard
                {showComments && (
                    <div className="mt-4 space-y-3">
                        <div className="max-h-32 overflow-y-auto space-y-2">
                            {comments.map((comment, index) => (
                                <div key={`comment-${comment._id || index}-${reel._id}`} className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                                        {comment.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-semibold">{comment.username}</span>
                                            {' '}{comment.text}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleComment} className="flex gap-2">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Post
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}