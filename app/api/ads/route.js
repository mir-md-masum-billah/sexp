// C:\Users\Admin\Desktop\sexp\app\api\ads\route.js
import { NextResponse } from 'next/server';

// Sample ads data - In production, fetch from database
const ads = [
    {
        id: 'ad1',
        title: '🔥 Special Offer! 50% Off',
        description: 'Get premium features at half the price. Limited time offer!',
        image: 'https://via.placeholder.com/300x200/FFD700/000000?text=50%+OFF',
        ctaUrl: 'https://example.com/offer',
        ctaText: 'Claim Offer',
        sponsor: 'Premium Features',
        views: 0,
        clicks: 0
    },
    {
        id: 'ad2',
        title: '🚀 New App Launch',
        description: 'Experience the next generation of video editing. Download now!',
        image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=NEW+APP',
        ctaUrl: 'https://example.com/app',
        ctaText: 'Download',
        sponsor: 'VideoEdit Pro',
        views: 0,
        clicks: 0
    },
    {
        id: 'ad3',
        title: '🎵 Music Streaming Free',
        description: 'Listen to your favorite songs for free. No subscription needed!',
        image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=MUSIC',
        ctaUrl: 'https://example.com/music',
        ctaText: 'Start Listening',
        sponsor: 'MusicStream',
        views: 0,
        clicks: 0
    },
    {
        id: 'ad4',
        title: '💻 Developer Tools Sale',
        description: 'Get 30% off on all developer tools and software.',
        image: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=DEVELOPER',
        ctaUrl: 'https://example.com/tools',
        ctaText: 'Shop Now',
        sponsor: 'DevTools Co',
        views: 0,
        clicks: 0
    }
];

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 5;

        // Randomize ads
        const shuffled = [...ads].sort(() => 0.5 - Math.random());
        const selectedAds = shuffled.slice(0, limit);

        return NextResponse.json({
            ads: selectedAds,
            total: ads.length
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching ads:', error);
        return NextResponse.json(
            { message: 'Error fetching ads' },
            { status: 500 }
        );
    }
}