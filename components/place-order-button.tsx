"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/app/actions/create-order";

type Props = {
  addressId: string;
  customerNote: string;
};

function Spinner() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function PlaceOrderButton({
  addressId,
  customerNote,
}: Props) {
  const router = useRouter();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function handlePlaceOrder() {
    if (!addressId) {
      setError("Please select a delivery address before placing your order.");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      const orderId = await createOrderAction(
        addressId,
        customerNote
      );

      if (!orderId) {
        throw new Error("Order could not be created.");
      }

      router.push(`/orders/${orderId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to place your order. Please try again."
      );
      setPlacing(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={placing || !addressId}
        aria-busy={placing}
        className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-green-700 px-5 text-sm font-black text-white shadow-lg shadow-green-800/10 transition duration-300 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
      >
        {placing ? (
          <>
            <Spinner />
            <span>Placing your order...</span>
          </>
        ) : (
          <>
            <span>Place order</span>
            <span className="text-green-200">•</span>
            <span>Cash on Delivery</span>
          </>
        )}
      </button>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            !
          </span>

          <span>{error}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-medium leading-5 text-gray-400">
        <LockIcon />
        <span>
          Your order details are securely verified before confirmation.
        </span>
      </div>
    </div>
  );
}