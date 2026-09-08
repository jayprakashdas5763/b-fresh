"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  addressId: string;
  customerNote: string;
};

export default function PlaceOrderButton({
  addressId,
  customerNote,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function handlePlaceOrder() {
    if (!addressId) {
      setError("Please select a delivery address.");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error: orderError } = await supabase.rpc(
        "create_order_from_cart",
        {
          p_address_id: addressId,
          p_customer_note: customerNote.trim() || null,
        }
      );

      if (orderError) {
        throw new Error(orderError.message);
      }

      if (!data) {
        throw new Error("Order could not be created.");
      }

      router.push(`/orders/${data}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to place your order."
      );
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={placing || !addressId}
        className="w-full rounded-xl bg-green-700 px-5 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placing
          ? "Placing Order..."
          : "Place Order — Cash on Delivery"}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}