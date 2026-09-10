"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import WishlistButton from "@/components/wishlist-button";

type ProductImage = {
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  unit: string;
  stock_quantity: number;
  is_active: boolean;
  product_images: ProductImage[];
};

type WishlistGridItem = {
  id: string;
  product: Product;
};

type Props = {
  initialItems: WishlistGridItem[];
};

export default function WishlistGrid({
  initialItems,
}: Props) {
  const [items, setItems] = useState(initialItems);

  function handleRemoved(productId: string) {
    setItems((current) =>
      current.filter((item) => item.product.id !== productId)
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-green-200 bg-[#fffdf7] px-6 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-100 text-3xl text-green-700">
          ♡
        </div>

        <h2 className="mt-5 text-xl font-black text-gray-900">
          Your wishlist is empty
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
          Save products you love and come back to them whenever you're ready.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex rounded-2xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {items.map(({ id, product }) => {
          const images = [...product.product_images].sort(
            (a, b) => a.sort_order - b.sort_order
          );

          const primaryImage = images[0];

          const hasDiscount =
            product.compare_at_price !== null &&
            Number(product.compare_at_price) > Number(product.price);

          return (
            <article
              key={id}
              className="group relative overflow-hidden rounded-2xl border border-green-100 bg-[#fffdf7] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl"
            >
              {/* Wishlist */}
              <div className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3">
                <WishlistButton
                  productId={product.id}
                  onRemoved={() => handleRemoved(product.id)}
                />
              </div>

              {/* Discount */}
              {hasDiscount && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-lime-300 px-2 py-1 text-[9px] font-black text-green-950 sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">
                  {Math.round(
                    ((Number(product.compare_at_price) - Number(product.price)) /
                      Number(product.compare_at_price)) *
                    100
                  )}
                  % OFF
                </span>
              )}

              <Link
                href={`/products/${encodeURIComponent(product.slug)}`}
                className="block"
              >
                {/* Image */}
                <div className="relative aspect-[0.95] overflow-hidden bg-green-50 sm:aspect-square">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.image_url}
                      alt={primaryImage.alt_text || product.name}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-green-50">
                      <span className="text-4xl sm:text-5xl">🥛</span>
                    </div>
                  )}

                  {/* Stock */}
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                    {product.stock_quantity <= 0 ? (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-[9px] font-bold text-red-700 sm:px-2.5 sm:text-[10px]">
                        Out of stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-green-800 shadow-sm backdrop-blur sm:px-2.5 sm:text-[10px]">
                        In stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                  <div className="mb-2 hidden sm:block">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-green-800">
                      Fresh
                    </span>
                  </div>

                  <h2 className="line-clamp-2 text-sm font-black leading-5 text-gray-900 sm:text-base sm:leading-6">
                    {product.name}
                  </h2>

                  {/* Hide description on mobile to keep cards compact */}
                  {product.description && (
                    <p className="mt-1.5 hidden line-clamp-2 text-xs leading-5 text-gray-500 sm:block">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mt-2.5">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-base font-black text-green-800 sm:text-lg">
                        ₹{Number(product.price).toFixed(2)}
                      </span>

                      {hasDiscount && (
                        <span className="text-[10px] text-gray-400 line-through sm:text-xs">
                          ₹
                          {Number(product.compare_at_price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-500 sm:text-xs">
                      per {product.unit}
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </>
  );
}