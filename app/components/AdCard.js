// C:\Users\Admin\Desktop\sexp\app\components\AdCard.js
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdCard({ ad, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    if (!isVisible) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-yellow-400 relative">
            <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full z-10">
                📢 SPONSORED
            </div>
            <button
                onClick={handleClose}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors z-10"
            >
                ✕
            </button>
            <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto bg-gradient-to-br from-yellow-400 to-orange-400">
                    {ad.image ? (
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                            📺
                        </div>
                    )}
                </div>
                <div className="flex-1 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ad.title}</h3>
                    <p className="text-gray-600 mb-4">{ad.description}</p>
                    <div className="flex flex-wrap gap-3">
                        {ad.ctaUrl && (
                            <Link
                                href={ad.ctaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-colors"
                            >
                                {ad.ctaText || 'Learn More'}
                            </Link>
                        )}
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Skip Ad
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}