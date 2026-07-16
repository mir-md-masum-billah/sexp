// C:\Users\Admin\Desktop\sexp\app\reels\[id]\page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import ReelPlayer from '../../components/ReelPlayer';

export default function ReelPage() {
    const params = useParams();
    const router = useRouter();
    const [reel, setReel] = useState(null);
    const [relatedReels, setRelatedReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReel();
    }, [params.id]);

    const fetchReel = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/reels/${params.id}`);
            const data = await response.json();

            if (response.ok) {
                setReel(data.reel);
                // Fetch related reels
                const relatedResponse = await fetch('/api/reels?limit=10');
                const relatedData = await relatedResponse.json();
                if (relatedResponse.ok) {
                    const filtered = relatedData.reels.filter(r => r._id !== data.reel._id);
                    setRelatedReels([data.reel, ...filtered]);
                    setCurrentIndex(0);
                }
            } else {
                router.push('/home');
            }
        } catch (error) {
            console.error('Error fetching reel:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-white">Loading reel...</p>
                </div>
            </div>
        );
    }

    if (!reel) return null;

    return (
        <>
            <Navbar />
            <ReelPlayer
                reels={relatedReels}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
            />
        </>
    );
}