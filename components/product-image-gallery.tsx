"use client";

import { useState } from "react";

type ProductImage = {
    image_url: string;
    alt_text: string | null;
    sort_order: number;
};

type ProductImageGalleryProps = {
    productName: string;
    images: ProductImage[];
};

export default function ProductImageGallery({
    productName,
    images,
}: ProductImageGalleryProps) {
    const sortedImages = [...images].sort(
        (a, b) => a.sort_order - b.sort_order
    );

    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedImage = sortedImages[selectedIndex];

    if (sortedImages.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                <span className="text-7xl">🥛</span>
            </div>
        );
    }

    return (
        <div>
            {/* Main image */}
            <div className="overflow-hidden rounded-2xl bg-gray-100">
                <img
                    src={selectedImage.image_url}
                    alt={selectedImage.alt_text || productName}
                    className="aspect-square h-full w-full object-cover"
                />
            </div>

            {/* Thumbnails */}
            {sortedImages.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={`${image.image_url}-${index}`}
                            type="button"
                            onClick={() => setSelectedIndex(index)}
                            className={`shrink-0 overflow-hidden rounded-xl border-2 ${
                                index === selectedIndex
                                    ? "border-green-700"
                                    : "border-gray-200"
                            }`}
                        >
                            <img
                                src={image.image_url}
                                alt={
                                    image.alt_text ||
                                    `${productName} image ${index + 1}`
                                }
                                className="h-20 w-20 object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}