"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type WishlistButtonProps = {
  productId: string;
  onRemoved?: () => void;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-5 w-5 transition-transform duration-200 ${filled ? "scale-105" : "scale-100"
        }`}
      aria-hidden="true"
    >
      <path d="M20.8 8.9c0 5.5-8.8 10.6-8.8 10.6S3.2 14.4 3.2 8.9A4.9 4.9 0 0 1 12 6.3a4.9 4.9 0 0 1 8.8 2.6Z" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-700 dark:border-green-800 dark:border-t-lime-300"
      aria-hidden="true"
    />
  );
}

export default function WishlistButton({
  productId,
  onRemoved,
}: WishlistButtonProps) {
  const supabase = createClient();
  const router = useRouter();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkWishlist() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setLoading(false);
        }

        return;
      }

      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (active) {
        setIsWishlisted(!!data);
        setLoading(false);
      }
    }

    checkWishlist();

    return () => {
      active = false;
    };
  }, [productId]);

  async function toggleWishlist() {
    if (saving || loading) {
      return;
    }

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

    setSaving(true);

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) {
          throw new Error(error.message);
        }

        setIsWishlisted(false);
        onRemoved?.();
      } else {
        const { error } = await supabase
          .from("wishlists")
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) {
          throw new Error(error.message);
        }

        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setSaving(false);
    }
  }

  const label = isWishlisted
    ? "Remove from wishlist"
    : "Add to wishlist";

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={loading || saving}
      aria-label={label}
      aria-pressed={isWishlisted}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition duration-200 sm:h-10 sm:w-10 ${isWishlisted
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-lime-300 dark:hover:bg-green-900"
          : "border-white/80 bg-white/95 text-gray-500 hover:border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800/80 dark:bg-green-950/95 dark:text-green-200/70 dark:hover:border-green-700 dark:hover:bg-green-900 dark:hover:text-lime-300"
        } ${loading || saving
          ? "cursor-not-allowed opacity-70"
          : "hover:scale-105 active:scale-95"
        }`}
    >
      {loading || saving ? (
        <Spinner />
      ) : (
        <HeartIcon filled={isWishlisted} />
      )}
    </button>
  );
}