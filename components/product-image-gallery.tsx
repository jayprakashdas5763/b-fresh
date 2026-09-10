"use client";

import Image from "next/image";
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

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414 0l4-4a1 1 0 0 1 1.414 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414 0l-4 4a1 1 0 0 1-1.414 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function ProductImageGallery({
  productName,
  images,
}: ProductImageGalleryProps) {
  const sortedImages = [...images].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (sortedImages.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-lime-50">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm sm:h-28 sm:w-28 sm:text-6xl">
          🥛
        </div>
      </div>
    );
  }

  const selectedImage = sortedImages[selectedIndex];

  function showPrevious() {
    setSelectedIndex((current) =>
      current === 0 ? sortedImages.length - 1 : current - 1
    );
  }

  function showNext() {
    setSelectedIndex((current) =>
      current === sortedImages.length - 1 ? 0 : current + 1
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="group relative overflow-hidden rounded-3xl bg-green-50">
        <div className="relative aspect-square">
          <Image
            src={selectedImage.image_url}
            alt={selectedImage.alt_text || productName}
            fill
            priority={selectedIndex === 0}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition duration-500"
          />
        </div>

        {/* Image count */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-gray-950/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}

        {/* Previous / next */}
        {sortedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <ChevronLeftIcon />
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="Next product image"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="mt-3">
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {sortedImages.map((image, index) => {
              const selected = index === selectedIndex;

              return (
                <button
                  key={`${image.image_url}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`View ${productName} image ${index + 1}`}
                  aria-current={selected ? "true" : undefined}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20 sm:rounded-2xl ${
                    selected
                      ? "border-green-600 ring-2 ring-green-100"
                      : "border-green-100 opacity-80 hover:border-green-300 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={
                      image.alt_text ||
                      `${productName} image ${index + 1}`
                    }
                    fill
                    sizes="80px"
                    className="object-cover"
                  />

                  {selected && (
                    <span className="absolute inset-x-0 bottom-0 bg-green-700/85 py-0.5 text-center text-[8px] font-black text-white">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile hint */}
      {sortedImages.length > 1 && (
        <p className="mt-2 text-center text-[10px] font-medium text-gray-400 sm:hidden">
          Tap a thumbnail or use the arrows to view more
        </p>
      )}
    </div>
  );
}