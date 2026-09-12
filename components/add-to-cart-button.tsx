"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AddToCartButtonProps = {
  productId: string;
  stockQuantity: number;
  compact?: boolean;
};

function MinusIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-3.5 w-3.5"
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
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M9.25 4.75a.75.75 0 1 1 1.5 0v3.5h3.5a.75.75 0 1 1 0 1.5h-3.5v3.5a.75.75 0 1 1-1.5 0v-3.5h-3.5a.75.75 0 1 1 0-1.5h3.5v-3.5Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.3 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L21 8H6" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
  );
}

export default function AddToCartButton({
  productId,
  stockQuantity,
  compact = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isOutOfStock = stockQuantity <= 0;

  async function addToCart() {
    if (loading || isOutOfStock) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/auth?next=${encodeURIComponent(
            window.location.pathname,
          )}`,
        );
        return;
      }

      let { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cartError) {
        throw new Error(cartError.message);
      }

      if (!cart) {
        const { data: newCart, error: createCartError } =
          await supabase
            .from("carts")
            .insert({
              user_id: user.id,
            })
            .select("id")
            .single();

        if (createCartError) {
          throw new Error(createCartError.message);
        }

        cart = newCart;
      }

      const { data: existingItem, error: itemError } =
        await supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("cart_id", cart.id)
          .eq("product_id", productId)
          .maybeSingle();

      if (itemError) {
        throw new Error(itemError.message);
      }

      const newQuantity = existingItem
        ? existingItem.quantity + quantity
        : quantity;

      if (newQuantity > stockQuantity) {
        throw new Error(
          `Only ${stockQuantity} item${stockQuantity === 1 ? "" : "s"
          } available.`,
        );
      }

      if (existingItem) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({
            quantity: newQuantity,
          })
          .eq("id", existingItem.id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity,
          });

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      setMessage(
        quantity === 1
          ? "Added to cart."
          : `${quantity} items added to cart.`,
      );

      router.refresh();
    } catch (error) {
      console.error("Add to cart error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to add this product to your cart.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (isOutOfStock) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-sm font-bold text-red-700 dark:text-red-300">
          Out of stock
        </p>

        <p className="mt-0.5 text-xs text-red-600 dark:text-red-300/80">
          This product is currently unavailable.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={addToCart}
        disabled={loading}
        aria-busy={loading}
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-3 text-xs font-black text-white shadow-sm transition hover:bg-green-800 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-700 dark:hover:bg-green-600 dark:focus:ring-lime-400"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <CartIcon />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector */}
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-green-200/70">
          Quantity
        </p>

        <div className="inline-flex items-center overflow-hidden rounded-2xl border border-green-100 bg-green-50/60 dark:border-green-900 dark:bg-green-950/60">
          <button
            type="button"
            onClick={() =>
              setQuantity((current) =>
                Math.max(1, current - 1),
              )
            }
            disabled={quantity <= 1 || loading}
            className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:bg-green-100 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-30 dark:text-green-200 dark:hover:bg-green-900 dark:hover:text-lime-300"
            aria-label="Decrease quantity"
          >
            <MinusIcon />
          </button>

          <span
            aria-live="polite"
            className="flex h-10 min-w-11 items-center justify-center border-x border-green-100 bg-white px-3 text-sm font-black text-gray-950 dark:border-green-900 dark:bg-[#102019] dark:text-white"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((current) =>
                Math.min(stockQuantity, current + 1),
              )
            }
            disabled={quantity >= stockQuantity || loading}
            className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:bg-green-100 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-30 dark:text-green-200 dark:hover:bg-green-900 dark:hover:text-lime-300"
            aria-label="Increase quantity"
          >
            <PlusIcon />
          </button>
        </div>

        {stockQuantity <= 10 && (
          <p className="mt-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-300">
            Only {stockQuantity} left in stock.
          </p>
        )}
      </div>

      {/* Add to cart */}
      <button
        type="button"
        onClick={addToCart}
        disabled={loading}
        aria-busy={loading}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-700 px-5 text-sm font-black text-white shadow-lg shadow-green-800/10 transition duration-300 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none dark:bg-green-700 dark:hover:bg-green-600 dark:focus:ring-green-900"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Adding to cart...</span>
          </>
        ) : (
          <>
            <CartIcon />
            <span>
              {quantity > 1
                ? `Add ${quantity} to Cart`
                : "Add to Cart"}
            </span>
          </>
        )}
      </button>

      {/* Feedback */}
      {message && (
        <div
          role={message.includes("Added") ? "status" : "alert"}
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${message.includes("Added")
              ? "border-green-100 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300"
              : "border-red-100 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            }`}
        >
          <div className="flex items-start gap-2.5">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black ${message.includes("Added")
                  ? "bg-green-600 text-white dark:bg-green-700"
                  : "bg-red-600 text-white dark:bg-red-700"
                }`}
            >
              {message.includes("Added") ? "✓" : "!"}
            </span>

            <span>{message}</span>
          </div>
        </div>
      )}

      <p className="text-center text-[10px] leading-4 text-gray-400 dark:text-green-200/50">
        Maximum quantity is limited by available stock.
      </p>
    </div>
  );
}