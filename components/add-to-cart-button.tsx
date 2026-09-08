"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AddToCartButtonProps = {
  productId: string;
  stockQuantity: number;
};

export default function AddToCartButton({
  productId,
  stockQuantity,
}: AddToCartButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isOutOfStock = stockQuantity <= 0;

  async function addToCart() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Find the customer's existing cart.
      let { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cartError) {
        throw new Error(cartError.message);
      }

      // Create a cart if the customer doesn't have one.
      if (!cart) {
        const { data: newCart, error: createCartError } = await supabase
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

      // Check whether the product is already in the cart.
      const { data: existingItem, error: itemError } = await supabase
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
          `Only ${stockQuantity} item${
            stockQuantity === 1 ? "" : "s"
          } available.`
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

      setMessage("Added to cart.");
      router.refresh();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to add this product to your cart."
      );
    } finally {
      setLoading(false);
    }
  }

  if (isOutOfStock) {
    return (
      <span className="inline-block rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-500">
        Out of stock
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() =>
            setQuantity((current) => Math.max(1, current - 1))
          }
          disabled={quantity <= 1 || loading}
          className="h-11 w-11 rounded-l-lg border border-gray-300 bg-white text-lg disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Decrease quantity"
        >
          −
        </button>

        <div className="flex h-11 w-14 items-center justify-center border-y border-gray-300 bg-white font-medium">
          {quantity}
        </div>

        <button
          type="button"
          onClick={() =>
            setQuantity((current) =>
              Math.min(stockQuantity, current + 1)
            )
          }
          disabled={quantity >= stockQuantity || loading}
          className="h-11 w-11 rounded-r-lg border border-gray-300 bg-white text-lg disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={addToCart}
        disabled={loading}
        className="rounded-xl bg-green-700 px-6 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>

      {message && (
        <p
          className={`text-sm ${
            message === "Added to cart."
              ? "text-green-700"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}