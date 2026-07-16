// C:\Users\Admin\Desktop\sexp\app\profile\[id]\page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import ReelCard from '../../components/ReelCard';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [user, setUser] = useState(null);
    const [reels, setReels] = useState([]);
    const [stats, setStats] = useState({});
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reels');

    useEffect(() => {
        fetchProfile();
    }, [params.id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user/${params.id}`);
            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setReels(data.reels);
                setStats(data.stats);
                setIsFollowing(data.isFollowing);
            } else {
                router.push('/home');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        try {
            const response = await fetch(`/api/user/${params.id}`, {
                method: 'POST',
            });
            const data = await response.json();
            if (response.ok) {
                setIsFollowing(data.following);
                setStats(prev => ({
                    ...prev,
                    followers: data.following ? prev.followers + 1 : prev.followers - 1
                }));
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const isOwnProfile = session?.user?.id === params.id;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                {user.profilepic ? (
                                    <img src={user.profilepic} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    user.username[0].toUpperCase()
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                                <h1 className="text-2xl font-bold">{user.name}</h1>
                                <p className="text-gray-500">@{user.username}</p>
                                {!isOwnProfile && session && (
                                    <button
                                        onClick={handleFollow}
                                        className={`px-6 py-2 rounded-full font-semibold transition-colors ${isFollowing
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                                            }`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                )}
                                {isOwnProfile && (
                                    <button
                                        onClick={() => router.push('/upload')}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors"
                                    >
                                        Upload Reel
                                    </button>
                                )}
                            </div>

                            {user.bio && (
                                <p className="text-gray-700 mb-4">{user.bio}</p>
                            )}

                            <div className="flex justify-center md:justify-start gap-8">
                                <div>
                                    <span className="font-bold text-lg">{stats.reelsCount || 0}</span>
                                    <span className="text-gray-500 ml-1">Reels</span>
                                </div>
                                <div>
                                    <span className="font-bold text-lg">{stats.followers || 0}</span>
                                    <span className="text-gray-500 ml-1">Followers</span>
                                </div>
                                <div>
                                    <span className="font-bold text-lg">{stats.following || 0}</span>
                                    <span className="text-gray-500 ml-1">Following</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('reels')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'reels'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        📹 Reels
                    </button>
                    <button
                        onClick={() => setActiveTab('liked')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'liked'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        ❤️ Liked
                    </button>
                </div>

                {/* Content */}
                // Update the reels rendering section in profile page
                {activeTab === 'reels' && (
                    <>
                        {reels.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reels.map((reel) => (
                                    <ReelCard
                                        key={`profile-reel-${reel._id}`}
                                        reel={reel}
                                        onDelete={isOwnProfile ? fetchProfile : null}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl shadow">
                                <p className="text-4xl mb-4">📹</p>
                                <p className="text-xl text-gray-600">No reels yet</p>
                                {isOwnProfile && (
                                    <Link href="/upload" className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                        Upload Your First Reel
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'liked' && (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <p className="text-4xl mb-4">❤️</p>
                        <p className="text-xl text-gray-600">Liked reels coming soon!</p>
                    </div>
                )}
            </div>
        </>
    );
}