// C:\Users\Admin\Desktop\sexp\app\upload\page.js
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

export default function UploadPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        thumbnail: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Redirect if not logged in
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.title || !formData.videoUrl) {
            setError('Title and Video URL are required');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/reels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                videoUrl: '',
                thumbnail: ''
            });

            setTimeout(() => {
                router.push('/home');
            }, 2000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Upload Reel</h1>
                            <p className="text-gray-600 mt-2">Share your creative video with the community</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                                <p className="text-sm text-green-700">Reel uploaded successfully! Redirecting...</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter reel title"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Describe your reel"
                                />
                            </div>

                            <div>
                                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                    Video URL *
                                </label>
                                <input
                                    id="videoUrl"
                                    name="videoUrl"
                                    type="url"
                                    required
                                    value={formData.videoUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://example.com/video.mp4"
                                />
                                <p className="mt-1 text-xs text-gray-500">Supported formats: MP4, WebM, OGG</p>
                            </div>

                            <div>
                                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                                    Thumbnail URL (Optional)
                                </label>
                                <input
                                    id="thumbnail"
                                    name="thumbnail"
                                    type="url"
                                    value={formData.thumbnail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="https://example.com/thumbnail.jpg"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-pink-700'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Uploading...
                                        </div>
                                    ) : (
                                        'Upload Reel'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/home')}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Upload Tips:</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Use high-quality videos in MP4 format</li>
                                <li>• Keep videos under 60 seconds for better engagement</li>
                                <li>• Add a catchy title and description</li>
                                <li>• Use a custom thumbnail for better visibility</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}