"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type WishlistButtonProps = {
    productId: string;
    onRemoved?: () => void;
};

export default function WishlistButton({
    productId,
    onRemoved
}: WishlistButtonProps) {
    const supabase = createClient();

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function checkWishlist() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from("wishlists")
                .select("id")
                .eq("user_id", user.id)
                .eq("product_id", productId)
                .maybeSingle();

            setIsWishlisted(!!data);
            setLoading(false);
        }

        checkWishlist();
    }, [productId]);

    async function toggleWishlist() {
        if (saving) return;

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("Please login to add products to your wishlist.");
            return;
        }

        setSaving(true);

        if (isWishlisted) {
            const { error } = await supabase
                .from("wishlists")
                .delete()
                .eq("user_id", user.id)
                .eq("product_id", productId);

            if (!error) {
                setIsWishlisted(false);
                onRemoved?.();

            } else {
                console.error("Remove wishlist error:", error.message);
            }
        } else {
            const { error } = await supabase
                .from("wishlists")
                .insert({
                    user_id: user.id,
                    product_id: productId,
                });

            if (!error) {
                setIsWishlisted(true);
            } else {
                console.error("Add wishlist error:", error.message);
            }
        }

        setSaving(false);
    }

    return (
        <button
            type="button"
            aria-label={
                isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
            }
            title={
                isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
            }
            disabled={loading || saving}
            onClick={toggleWishlist}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-2xl shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isWishlisted ? "♥" : "♡"}
        </button>
    );
}