// C:\Users\Admin\Desktop\sexp\app\components\ReelPlayer.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReelPlayer({ reels, currentIndex, onIndexChange }) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const router = useRouter();

    const currentReel = reels[currentIndex];

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(console.error);
        }
    }, [currentIndex]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(progress);
        }
    };

    const handleNext = () => {
        if (currentIndex < reels.length - 1) {
            onIndexChange(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
        }
    };

    if (!currentReel) return null;

    return (
        <div className="relative bg-black min-h-screen flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-[9/16]">
                <video
                    ref={videoRef}
                    src={currentReel.videoUrl}
                    className="w-full h-full object-contain"
                    onClick={togglePlay}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleNext}
                    loop={false}
                    playsInline
                />

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <div className="w-full bg-gray-600 rounded-full h-1 mb-2">
                        <div
                            className="bg-white rounded-full h-1 transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-white text-sm">
                        <span>{currentReel.username}</span>
                        <span>{currentReel.title}</span>
                    </div>
                </div>

                {/* Navigation controls */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                    <button
                        onClick={handlePrev}
                        className={`p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={currentIndex === 0}
                    >
                        ◀
                    </button>
                    <button
                        onClick={handleNext}
                        className={`p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors ${currentIndex === reels.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={currentIndex === reels.length - 1}
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
}