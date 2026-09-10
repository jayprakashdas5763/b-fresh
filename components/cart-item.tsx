"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CartItemProps = {
  itemId: string;
  productSlug: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  stockQuantity: number;
  imageUrl: string | null;
};

function MinusIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="M4 9.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 1 1 0 1.5H4.75A.75.75 0 0 1 4 9.25Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="M9.25 4.75a.75.75 0 1 1 1.5 0v3.5h3.5a.75.75 0 1 1 0 1.5h-3.5v3.5a.75.75 0 1 1-1.5 0v-3.5h-3.5a.75.75 0 1 1 0-1.5h3.5v-3.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M7 7l1 13h8l1-13" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-green-200 border-t-green-700"
      aria-hidden="true"
    />
  );
}

export default function CartItem({
  itemId,
  productSlug,
  name,
  price,
  unit,
  quantity: initialQuantity,
  stockQuantity,
  imageUrl,
}: CartItemProps) {
  const router = useRouter();
  const supabase = createClient();

  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemTotal = Number(price) * quantity;
  const canDecrease = quantity > 1;
  const canIncrease = quantity < stockQuantity;

  async function updateQuantity(nextQuantity: number) {
    if (
      nextQuantity < 1 ||
      nextQuantity > stockQuantity ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: nextQuantity,
      })
      .eq("id", itemId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setQuantity(nextQuantity);
      router.refresh();
    }

    setLoading(false);
  }

  async function removeItem() {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <article
      className={`relative px-3 py-3 sm:p-5 ${
        loading ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-3 sm:gap-5">
        {/* Product image */}
        <Link
          href={`/products/${encodeURIComponent(productSlug)}?from=cart`}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-50 to-lime-50 ring-1 ring-green-100 sm:h-28 sm:w-28 sm:rounded-2xl"
          aria-label={`View ${name}`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 639px) 64px, 112px"
              className="object-cover transition duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl sm:text-4xl">🥛</span>
            </div>
          )}
        </Link>

        {/* Product information */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/products/${encodeURIComponent(productSlug)}?from=cart`}
                className="line-clamp-2 text-sm font-black leading-5 text-gray-950 transition hover:text-green-700 sm:text-base sm:leading-6"
              >
                {name}
              </Link>

              <p className="mt-0.5 text-[11px] font-medium text-gray-500 sm:mt-1 sm:text-sm">
                ₹{Number(price).toFixed(2)} / {unit}
              </p>
            </div>

            {/* Desktop total */}
            <p className="hidden shrink-0 text-base font-black text-gray-950 sm:block">
              ₹{itemTotal.toFixed(2)}
            </p>
          </div>

          {/* Controls */}
          <div className="mt-2.5 flex items-center justify-between gap-2 sm:mt-4">
            <div
              className="inline-flex items-center overflow-hidden rounded-lg border border-green-100 bg-green-50/60"
              aria-label={`Quantity for ${name}`}
            >
              <button
                type="button"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={!canDecrease || loading}
                className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-green-100 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
                aria-label={`Decrease quantity of ${name}`}
              >
                <MinusIcon />
              </button>

              <span className="flex h-8 min-w-8 items-center justify-center border-x border-green-100 bg-white px-1.5 text-xs font-black text-gray-950 sm:h-9 sm:min-w-9">
                {loading ? <Spinner /> : quantity}
              </span>

              <button
                type="button"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={!canIncrease || loading}
                className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-green-100 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-30 sm:h-9 sm:w-9"
                aria-label={`Increase quantity of ${name}`}
              >
                <PlusIcon />
              </button>
            </div>

            <button
              type="button"
              onClick={removeItem}
              disabled={loading}
              aria-label={`Remove ${name} from cart`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-2 sm:py-1.5"
            >
              <TrashIcon />
              <span className="hidden text-xs font-bold sm:inline">
                Remove
              </span>
            </button>
          </div>

          {/* Mobile total */}
          <div className="mt-2.5 flex items-center justify-between sm:hidden">
            <span className="text-[10px] font-medium text-gray-400">
              Item total
            </span>

            <span className="text-sm font-black text-gray-950">
              ₹{itemTotal.toFixed(2)}
            </span>
          </div>

          {error && (
            <div className="mt-2 rounded-xl border border-red-100 bg-red-50 p-2.5 text-[11px] leading-5 text-red-700">
              {error}
            </div>
          )}

          {stockQuantity > 0 && quantity === stockQuantity && (
            <p className="mt-1.5 text-[9px] font-semibold text-amber-600">
              Maximum available quantity selected.
            </p>
          )}

          {stockQuantity <= 0 && (
            <p className="mt-1.5 text-[11px] font-bold text-red-600">
              Currently out of stock.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}