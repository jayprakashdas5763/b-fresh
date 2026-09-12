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
      current.filter(
        (item) => item.product.id !== productId,
      ),
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-green-200 bg-[#fffdf7] px-6 py-12 text-center transition-colors dark:border-green-900 dark:bg-green-950/70">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-100 text-3xl text-green-700 dark:bg-lime-950 dark:text-lime-300">
          ♡
        </div>

        <h2 className="mt-5 text-xl font-black text-gray-900 dark:text-white">
          Your wishlist is empty
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-green-200/70">
          Save products you love and come back to them whenever
          you're ready.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex rounded-2xl bg-green-700 px-5 py-3 font-bold text-white transition hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-green-200/60">
          {items.length}{" "}
          {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {items.map(({ id, product }) => {
          const images = [
            ...product.product_images,
          ].sort(
            (a, b) => a.sort_order - b.sort_order,
          );

          const primaryImage = images[0];

          const hasDiscount =
            product.compare_at_price !== null &&
            Number(product.compare_at_price) >
            Number(product.price);

          const discountPercentage = hasDiscount
            ? Math.round(
              ((Number(
                product.compare_at_price,
              ) -
                Number(product.price)) /
                Number(
                  product.compare_at_price,
                )) *
              100,
            )
            : 0;

          const isOutOfStock =
            product.stock_quantity <= 0;

          return (
            <article
              key={id}
              className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-green-100 bg-[#fffdf7] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/10 dark:border-green-900 dark:bg-green-950/70 dark:hover:border-green-700 dark:hover:shadow-black/30 sm:rounded-3xl"
            >
              {/* Wishlist */}
              <div className="absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3">
                <WishlistButton
                  productId={product.id}
                  onRemoved={() =>
                    handleRemoved(
                      product.id,
                    )
                  }
                />
              </div>

              {/* Discount */}
              {hasDiscount && (
                <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-green-700 px-2 py-1 text-[9px] font-black text-white shadow-md dark:bg-lime-400 dark:text-green-950 sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
                  {discountPercentage}% OFF
                </span>
              )}

              <Link
                href={`/products/${encodeURIComponent(
                  product.slug,
                )}`}
                className="block"
              >
                {/* Image */}
                <div className="relative aspect-[0.95] overflow-hidden bg-gradient-to-br from-green-50 via-white to-lime-50 dark:from-green-950 dark:via-green-900 dark:to-[#102019] sm:aspect-square">
                  {primaryImage ? (
                    <Image
                      src={
                        primaryImage.image_url
                      }
                      alt={
                        primaryImage.alt_text ||
                        product.name
                      }
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl shadow-inner dark:bg-green-900 sm:h-24 sm:w-24 sm:text-5xl">
                        🥛
                      </div>
                    </div>
                  )}

                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"
                    aria-hidden="true"
                  />

                  {/* Stock */}
                  <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50/95 px-2 py-1 text-[9px] font-bold text-red-700 shadow-sm backdrop-blur dark:border-red-900 dark:bg-red-950/90 dark:text-red-300 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
                        Out of stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-[9px] font-bold text-green-800 shadow-sm backdrop-blur dark:border-green-800 dark:bg-green-950/90 dark:text-lime-300 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        In stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                  <div className="mb-2 hidden sm:block">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-green-800 dark:bg-green-950 dark:text-lime-300">
                      Fresh
                    </span>
                  </div>

                  <h2 className="line-clamp-2 text-sm font-black leading-5 text-gray-900 transition group-hover:text-green-700 dark:text-white dark:group-hover:text-lime-300 sm:text-base sm:leading-6">
                    {product.name}
                  </h2>

                  {product.description && (
                    <p className="mt-1.5 hidden line-clamp-2 text-xs leading-5 text-gray-500 dark:text-green-200/60 sm:block">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mt-2.5">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-base font-black text-green-800 dark:text-lime-300 sm:text-lg">
                        ₹
                        {Number(
                          product.price,
                        ).toFixed(2)}
                      </span>

                      {hasDiscount && (
                        <span className="text-[10px] text-gray-400 line-through dark:text-gray-500 sm:text-xs">
                          ₹
                          {Number(
                            product.compare_at_price,
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-500 dark:text-green-200/60 sm:text-xs">
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