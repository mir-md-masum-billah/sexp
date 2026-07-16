// C:\Users\Admin\Desktop\sexp\app\home\page.js
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import ReelCard from '../components/ReelCard';
import AdCard from '../components/AdCard';

// Sample ads data - Move outside component to prevent re-creation
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

export default function HomePage() {
    const { data: session } = useSession();
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState('');
    const [adIndex, setAdIndex] = useState(0);

    const fetchReels = useCallback(async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`/api/reels?page=${pageNum}&limit=10`);
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
    }, []);

    useEffect(() => {
        fetchReels(1, false);
    }, [fetchReels]);

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

    const loadMore = () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchReels(nextPage, true);
        }
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

    const handleAdClose = (adKey) => {
        // Remove the ad from the displayed items by filtering it out
        setReels(prev => prev);
        // Force a re-render of the memoized items
        setAdIndex(prev => prev + 1);
    };

    if (error) {
        return (
            <>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
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
            <div className="max-w-4xl mx-auto px-4 py-8">
                {loading && reels.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading reels...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedItems.map((item) => (
                                item.type === 'reel' ? (
                                    <ReelCard
                                        key={item.key}
                                        reel={item.data}
                                        onLike={handleLike}
                                        onDelete={handleDelete}
                                    />
                                ) : (
                                    <AdCard
                                        key={item.key}
                                        ad={item.data}
                                        onClose={() => handleAdClose(item.key)}
                                    />
                                )
                            ))}
                        </div>

                        {loading && reels.length > 0 && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="mt-2 text-sm text-gray-500">Loading more...</p>
                            </div>
                        )}

                        {hasMore && !loading && reels.length > 0 && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={loadMore}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Load More
                                </button>
                            </div>
                        )}

                        {!hasMore && reels.length > 0 && (
                            <p className="text-center text-gray-500 mt-8">No more reels to load</p>
                        )}

                        {!loading && reels.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-4xl mb-4">📹</p>
                                <p className="text-xl text-gray-600">No reels yet</p>
                                <p className="text-gray-500">Be the first to upload!</p>
                                <a href="/upload" className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                    Upload Reel
                                </a>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}