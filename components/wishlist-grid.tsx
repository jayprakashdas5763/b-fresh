"use client";

import { useState } from "react";
import Link from "next/link";
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
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <div className="text-5xl">♡</div>

        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Your wishlist is empty
        </h2>

        <p className="mt-2 text-gray-600">
          Save products you like and come back to them later.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          {items.length}{" "}
          {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ id, product }) => {
          const images = [...product.product_images].sort(
            (a, b) => a.sort_order - b.sort_order
          );

          const primaryImage = images[0];

          return (
            <article
              key={id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="absolute right-3 top-3 z-10">
                <WishlistButton
                  productId={product.id}
                  onRemoved={() => handleRemoved(product.id)}
                />
              </div>

              <Link
                href={`/products/${encodeURIComponent(product.slug)}`}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={
                        primaryImage.alt_text ||
                        product.name
                      }
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-5xl">🥛</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
                    {product.name}
                  </h2>

                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{Number(product.price).toFixed(2)}
                      </p>

                      <p className="text-sm text-gray-500">
                        per {product.unit}
                      </p>
                    </div>

                    {product.compare_at_price !== null &&
                      product.compare_at_price >
                        product.price && (
                        <p className="text-sm text-gray-400 line-through">
                          ₹
                          {Number(
                            product.compare_at_price
                          ).toFixed(2)}
                        </p>
                      )}
                  </div>

                  <div className="mt-4">
                    {product.stock_quantity <= 0 ? (
                      <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Out of stock
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        In stock
                      </span>
                    )}
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