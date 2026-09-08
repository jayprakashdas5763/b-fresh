"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CartItemProps = {
  itemId: string;
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  stockQuantity: number;
  imageUrl: string | null;
};

export default function CartItem({
  itemId,
  productId,
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

  async function updateQuantity(nextQuantity: number) {
    if (nextQuantity < 1 || nextQuantity > stockQuantity || loading) {
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
    if (loading) return;

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
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex gap-4">
        {/* Product image */}
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-3xl">🥛</span>
            </div>
          )}
        </div>

        {/* Product information */}
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900">{name}</h2>

          <p className="mt-1 text-sm text-gray-500">
            ₹{Number(price).toFixed(2)} / {unit}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Quantity */}
            <div className="flex items-center rounded-lg border border-gray-300">
              <button
                type="button"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1 || loading}
                className="h-9 w-9 text-lg disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Decrease quantity of ${name}`}
              >
                −
              </button>

              <span className="flex h-9 w-10 items-center justify-center border-x border-gray-300 text-sm font-medium">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= stockQuantity || loading}
                className="h-9 w-9 text-lg disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Increase quantity of ${name}`}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={removeItem}
              disabled={loading}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Item total */}
        <div className="shrink-0 text-right">
          <p className="font-semibold text-gray-900">
            ₹{(Number(price) * quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}