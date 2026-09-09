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
      "Are you sure you want to cancel this order?"
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
        }
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
          : "Unable to cancel the order."
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
        className="rounded-lg border border-red-300 px-5 py-3 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cancelling ? "Cancelling..." : "Cancel Order"}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}