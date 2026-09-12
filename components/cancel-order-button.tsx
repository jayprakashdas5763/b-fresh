"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  orderId: string;
  paymentMethod: string;
  paymentStatus: string;
};

export default function CancelOrderButton({
  orderId,
  paymentMethod,
  paymentStatus,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isPaidRazorpay =
    paymentMethod === "razorpay" &&
    paymentStatus === "paid";

  async function handleCancel() {
    const confirmed = window.confirm(
      isPaidRazorpay
        ? "This order has already been paid. Cancelling it will request a refund through Razorpay. Continue?"
        : "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      if (isPaidRazorpay) {
        const response = await fetch(
          "/api/payments/razorpay/refund",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to request the refund.",
          );
        }

        setMessage(
          data.refundStatus === "processed"
            ? "Refund processed successfully."
            : "Refund requested successfully. Your payment is being refunded.",
        );

        router.refresh();
        return;
      }

      const { data, error: cancelError } =
        await supabase.rpc("cancel_my_order", {
          p_order_id: orderId,
        });

      if (cancelError) {
        throw new Error(cancelError.message);
      }

      if (!data) {
        throw new Error("Order could not be cancelled.");
      }

      setMessage("Your order has been cancelled.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the order.",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={cancelling}
        className="rounded-xl border border-red-300 bg-white px-5 py-3 font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-700 dark:hover:bg-red-950/60"
      >
        {cancelling
          ? isPaidRazorpay
            ? "Requesting refund..."
            : "Cancelling..."
          : isPaidRazorpay
            ? "Cancel & Request Refund"
            : "Cancel Order"}
      </button>

      {message && (
        <p className="mt-3 rounded-xl border border-green-100 bg-green-50 p-3 text-sm leading-5 text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}