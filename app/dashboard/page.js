// C:\Users\Admin\Desktop\sexp\app\dashboard\page.js
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userStats, setUserStats] = useState({
        totalReels: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
    });
    const [recentReels, setRecentReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        fetchDashboardData();
    }, [status]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user/${session?.user?.id}`);
            const data = await response.json();

            if (response.ok) {
                const reels = data.reels || [];
                setUserStats({
                    totalReels: reels.length,
                    totalViews: reels.reduce((sum, reel) => sum + (reel.views || 0), 0),
                    totalLikes: reels.reduce((sum, reel) => sum + (reel.likes?.length || 0), 0),
                    totalComments: reels.reduce((sum, reel) => sum + (reel.comments?.length || 0), 0)
                });
                setRecentReels(reels.slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {session?.user?.name || session?.user?.username}!</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600">{userStats.totalReels}</div>
                        <p className="text-gray-600 text-sm">Total Reels</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600">{userStats.totalViews}</div>
                        <p className="text-gray-600 text-sm">Total Views</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-red-600">{userStats.totalLikes}</div>
                        <p className="text-gray-600 text-sm">Total Likes</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-600">{userStats.totalComments}</div>
                        <p className="text-gray-600 text-sm">Total Comments</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link href="/upload" className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
                        <div className="text-3xl mb-2">🎬</div>
                        <h3 className="font-semibold">Upload New Reel</h3>
                        <p className="text-sm opacity-90">Share your creativity</p>
                    </Link>
                    <Link href={`/profile/${session?.user?.id}`} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="text-3xl mb-2">👤</div>
                        <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                        <p className="text-sm text-gray-600">Update your information</p>
                    </Link>
                    <Link href="/home" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="text-3xl mb-2">📱</div>
                        <h3 className="font-semibold text-gray-900">Explore Reels</h3>
                        <p className="text-sm text-gray-600">Discover new content</p>
                    </Link>
                </div>

                {/* Recent Reels */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Reels</h2>
                        <Link href={`/profile/${session?.user?.id}`} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                            View All →
                        </Link>
                    </div>

                    {recentReels.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentReels.map((reel) => (
                                <Link href={`/reels/${reel._id}`} key={reel._id} className="group">
                                    <div className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                                        <video
                                            src={reel.videoUrl}
                                            className="w-full h-full object-cover"
                                            poster={reel.thumbnail}
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-semibold">View Reel</span>
                                        </div>
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <p className="text-white text-sm font-medium truncate">{reel.title}</p>
                                            <div className="flex gap-3 text-white text-xs">
                                                <span>❤️ {reel.likes?.length || 0}</span>
                                                <span>💬 {reel.comments?.length || 0}</span>
                                                <span>👁️ {reel.views || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-4xl mb-4">🎬</p>
                            <p className="text-gray-600">You haven't uploaded any reels yet</p>
                            <Link href="/upload" className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                Upload Your First Reel
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}