"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  orderId: string;
};

export default function CancelOrderButton({ orderId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error: cancelError } = await supabase.rpc(
        "cancel_my_order",
        {
          p_order_id: orderId,
        },
      );

      if (cancelError) {
        throw new Error(cancelError.message);
      }

      if (!data) {
        throw new Error("Order could not be cancelled.");
      }

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
        className="rounded-xl border border-red-300 bg-white px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60 dark:hover:border-red-700"
      >
        {cancelling ? "Cancelling..." : "Cancel Order"}
      </button>

      {error && (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}