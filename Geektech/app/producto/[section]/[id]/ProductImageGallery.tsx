'use client';

import Image from 'next/image';
import { useState } from 'react';

type ProductImageGalleryProps = {
    productName: string;
    images: string[];
};

export default function ProductImageGallery({ productName, images }: ProductImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [zoomActive, setZoomActive] = useState(false);
    const [transformOrigin, setTransformOrigin] = useState('50% 50%');

    const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;

        setTransformOrigin(`${x}% ${y}%`);
    };

    return (
        <section className="rounded-[28px] border border-white/10 bg-[#12121b] p-4 shadow-2xl shadow-black/30 sm:p-6">
            <div
                className="group relative mb-4 aspect-[4/3] overflow-hidden rounded-[24px] border border-white/10 bg-[#0d0d14] cursor-zoom-in"
                onMouseEnter={() => setZoomActive(true)}
                onMouseLeave={() => {
                    setZoomActive(false);
                    setTransformOrigin('50% 50%');
                }}
                onMouseMove={handlePointerMove}
            >
                <Image
                    src={selectedImage}
                    alt={productName}
                    fill
                    priority
                    className={`object-cover transition-transform duration-200 ease-out ${zoomActive ? 'scale-[1.9]' : 'scale-100 group-hover:scale-110'}`}
                    style={{ transformOrigin }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-sm">
                    Zoom
                </div>
            </div>

            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                    {images.map((image, index) => {
                        const isActive = selectedImage === image;

                        return (
                            <button
                                key={`${image}-${index}`}
                                type="button"
                                onClick={() => setSelectedImage(image)}
                                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                                aria-pressed={isActive}
                                className={`relative aspect-square overflow-hidden rounded-xl border bg-[#0d0d14] transition duration-200 ${isActive ? 'border-purple-400 shadow-lg shadow-purple-500/20' : 'border-white/10 hover:border-white/30'}`}
                            >
                                <Image
                                    src={image}
                                    alt={`${productName} ${index + 1}`}
                                    fill
                                    className={`object-cover transition-transform duration-200 ${isActive ? 'scale-105' : 'hover:scale-110'}`}
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}