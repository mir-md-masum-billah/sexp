// C:\Users\Admin\Desktop\sexp\app\reels\page.js
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import ReelCard from '../components/ReelCard';
import AdCard from '../components/AdCard';

// Sample ads data - Move outside component
const SAMPLE_ADS = [
    {
        id: 'ad1',
        title: '🔥 Special Offer! 50% Off',
        description: 'Get premium features at half the price. Limited time offer!',
        image: 'https://via.placeholder.com/300x200/FFD700/000000?text=50%+OFF',
        ctaUrl: 'https://example.com/offer',
        ctaText: 'Claim Offer',
        sponsor: 'Premium Features'
    },
    {
        id: 'ad2',
        title: '🚀 New App Launch',
        description: 'Experience the next generation of video editing. Download now!',
        image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=NEW+APP',
        ctaUrl: 'https://example.com/app',
        ctaText: 'Download',
        sponsor: 'VideoEdit Pro'
    },
    {
        id: 'ad3',
        title: '🎵 Music Streaming Free',
        description: 'Listen to your favorite songs for free. No subscription needed!',
        image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=MUSIC',
        ctaUrl: 'https://example.com/music',
        ctaText: 'Start Listening',
        sponsor: 'MusicStream'
    }
];

export default function ReelsPage() {
    const { data: session } = useSession();
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [filter, setFilter] = useState('latest');
    const [error, setError] = useState('');
    const [adIndex, setAdIndex] = useState(0);
    const observerRef = useRef();

    const fetchReels = useCallback(async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            setError('');

            let url = `/api/reels?page=${pageNum}&limit=12`;

            if (filter === 'popular') {
                url += '&sort=popular';
            } else if (filter === 'following') {
                url += '&following=true';
            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                if (append) {
                    setReels(prev => {
                        const existingIds = new Set(prev.map(r => r._id));
                        const newReels = data.reels.filter(r => !existingIds.has(r._id));
                        return [...prev, ...newReels];
                    });
                } else {
                    setReels(data.reels);
                }
                setHasMore(data.pagination.page < data.pagination.pages);
            } else {
                setError(data.message || 'Failed to fetch reels');
            }
        } catch (error) {
            console.error('Error fetching reels:', error);
            setError('An error occurred while fetching reels');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    // Use useMemo to insert ads without causing infinite loops
    const displayedItems = useMemo(() => {
        if (reels.length === 0) return [];

        const items = [];
        let reelIndex = 0;
        let currentAdIndex = adIndex;
        let reelsSinceLastAd = 0;

        while (reelIndex < reels.length) {
            // Add a reel
            items.push({
                type: 'reel',
                data: reels[reelIndex],
                key: `reel-${reels[reelIndex]._id}`
            });
            reelIndex++;
            reelsSinceLastAd++;

            // Show ad after every 2-3 reels
            if (reelsSinceLastAd >= 2 && reelIndex < reels.length) {
                const shouldShowAd = Math.random() > 0.3;
                if (shouldShowAd) {
                    const ad = SAMPLE_ADS[currentAdIndex % SAMPLE_ADS.length];
                    items.push({
                        type: 'ad',
                        data: ad,
                        key: `ad-${currentAdIndex}-${Date.now()}`
                    });
                    currentAdIndex++;
                    reelsSinceLastAd = 0;
                }
            }
        }

        return items;
    }, [reels, adIndex]);

    useEffect(() => {
        setReels([]);
        setPage(1);
        setHasMore(true);
        fetchReels(1, false);
    }, [filter, fetchReels]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchReels(nextPage, true);
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, page, fetchReels]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setReels([]);
        setPage(1);
        setHasMore(true);
        setAdIndex(0);
    };

    const handleLike = (reelId, liked) => {
        setReels(prev => prev.map(reel =>
            reel._id === reelId
                ? {
                    ...reel,
                    likes: liked
                        ? [...reel.likes, session?.user?.id]
                        : reel.likes.filter(id => id !== session?.user?.id)
                }
                : reel
        ));
    };

    const handleDelete = (reelId) => {
        setReels(prev => prev.filter(reel => reel._id !== reelId));
    };

    const handleAdClose = () => {
        setAdIndex(prev => prev + 1);
    };

    if (error) {
        return (
            <>
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <p className="text-red-700">{error}</p>
                        <button
                            onClick={() => fetchReels(1, false)}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Explore Reels</h1>
                            <p className="text-gray-600 mt-1">Discover amazing short videos</p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            {/* Filter buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleFilterChange('latest')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'latest'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Latest
                                </button>
                                <button
                                    onClick={() => handleFilterChange('popular')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'popular'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Popular
                                </button>
                                {session && (
                                    <button
                                        onClick={() => handleFilterChange('following')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'following'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Following
                                    </button>
                                )}
                            </div>

                            {/* View mode toggle */}
                            <div className="flex bg-white rounded-lg shadow-sm">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-2 rounded-l-lg transition-colors ${viewMode === 'grid'
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    ⊞ Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 rounded-r-lg transition-colors ${viewMode === 'list'
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    ≡ List
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reels Grid/List */}
                    {displayedItems.length > 0 ? (
                        <div className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                : 'space-y-6'
                        }>
                            {displayedItems.map((item) => (
                                item.type === 'reel' ? (
                                    <ReelCard
                                        key={item.key}
                                        reel={item.data}
                                        onLike={handleLike}
                                        onDelete={item.data.userId?._id === session?.user?.id ? handleDelete : null}
                                    />
                                ) : (
                                    <AdCard
                                        key={item.key}
                                        ad={item.data}
                                        onClose={handleAdClose}
                                    />
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                            <div className="text-6xl mb-4">📹</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reels Found</h3>
                            <p className="text-gray-500">
                                {filter === 'following'
                                    ? "You're not following anyone yet. Follow some creators to see their reels!"
                                    : "No reels available at the moment. Check back later!"}
                            </p>
                            {filter === 'following' && (
                                <Link
                                    href="/home"
                                    className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Explore Reels
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Loading indicator */}
                    {loading && reels.length > 0 && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading more reels...</p>
                        </div>
                    )}

                    {/* Initial loading */}
                    {loading && reels.length === 0 && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading reels...</p>
                        </div>
                    )}

                    {/* Infinite scroll trigger */}
                    {hasMore && !loading && reels.length > 0 && (
                        <div ref={observerRef} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        </div>
                    )}

                    {/* End of list */}
                    {!hasMore && reels.length > 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-4xl mb-2">🎉</p>
                            <p>You've seen all reels!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}