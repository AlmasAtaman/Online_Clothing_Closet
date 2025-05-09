"use client"

import { useEffect, useState } from 'react';

export default function ImageGallery() {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch('http://localhost:8000/images', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch images');
                }

                const data = await response.json();
                console.log("Fetched data:", data); // ← Add this line here

                setImages(Array.isArray(data.presignedUrls) ? data.presignedUrls : []);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load images');
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    if (loading) return <div>Loading images...</div>;
    if (error) return <div>Error: {error}</div>;
    if (images.length === 0) return <div>No images found</div>;

    return (
        <div className="grid grid-cols-3 gap-4 p-4">
            {images.map((url, index) => (
                <div key={index} className="relative aspect-square">
                    <img
                        src={url}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>
            ))}
        </div>
    );
} 