import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CancelOrderButton from "@/components/cancel-order-button";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View your B-Fresh order history and order status.",
  robots: {
    index: false,
    follow: false,
  },
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  packed: "bg-violet-100 text-violet-800 border-violet-200",
  out_for_delivery: "bg-lime-100 text-lime-800 border-lime-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const cancellableStatuses = [
  "pending",
  "confirmed",
  "processing",
  "packed",
];

function formatStatus(status: string) {
  return (
    statusLabels[status] ??
    status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      payment_method,
      payment_status,
      subtotal,
      delivery_fee,
      total_amount,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#f4faef] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900">
              Unable to load your orders
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Something went wrong while loading your order history.
            </p>

            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error.message}
            </p>

            <Link
              href="/account"
              className="mt-6 inline-flex rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Back to Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4faef] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-green-100 bg-[#fffdf7] shadow-sm">
          <div className="relative px-5 py-7 sm:px-8 sm:py-9">
            <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-lime-200/40 blur-2xl" />
            <div className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800">
                  <span className="h-2 w-2 rounded-full bg-green-600" />
                  B-Fresh Orders
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  My Orders
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
                  Track your fresh deliveries, review past orders, and see
                  payment details in one place.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>

        {/* Orders */}
        {orders && orders.length > 0 ? (
          <div className="mt-6 space-y-4 sm:mt-8">
            {orders.map((order) => {
              const statusClass =
                statusStyles[order.status] ??
                "bg-gray-100 text-gray-700 border-gray-200";

              const canCancel = cancellableStatuses.includes(order.status);

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-green-100 bg-[#fffdf7] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Link
                    href={`/orders/${order.id}`}
                    className="block p-5 sm:p-6"
                  >
                    {/* Top row */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-green-800">
                            Order
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${statusClass}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                          #{order.order_number}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Total
                        </p>

                        <p className="mt-1 text-2xl font-black text-green-800">
                          ₹{Number(order.total_amount).toFixed(2)}
                        </p>

                        <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-gray-600">
                          {order.payment_method === "cod"
                            ? "Cash on Delivery"
                            : order.payment_method}
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-green-100 pt-5 sm:grid-cols-3">
                      <div className="rounded-2xl bg-green-50/70 p-3.5">
                        <p className="text-xs font-medium text-gray-500">
                          Subtotal
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          ₹{Number(order.subtotal).toFixed(2)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-green-50/70 p-3.5">
                        <p className="text-xs font-medium text-gray-500">
                          Delivery
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          ₹{Number(order.delivery_fee).toFixed(2)}
                        </p>
                      </div>

                      <div className="col-span-2 rounded-2xl bg-green-50/70 p-3.5 sm:col-span-1">
                        <p className="text-xs font-medium text-gray-500">
                          Payment
                        </p>
                        <p className="mt-1 text-sm font-bold capitalize text-gray-900">
                          {order.payment_status}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-500">
                        View order details
                      </span>

                      <span className="font-bold text-green-700 transition group-hover:text-green-800">
                        →
                      </span>
                    </div>
                  </Link>

                  {/* Cancel */}
                  {canCancel && (
                    <div className="border-t border-green-100 bg-white/50 px-5 py-4 sm:px-6">
                      <CancelOrderButton orderId={order.id} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <section className="mt-6 rounded-3xl border border-dashed border-green-200 bg-[#fffdf7] px-6 py-12 text-center shadow-sm sm:mt-8 sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100 text-2xl">
              🛒
            </div>

            <h2 className="mt-5 text-2xl font-black text-gray-900">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              Your B-Fresh orders will appear here once you place your first
              order.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-2xl bg-green-700 px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md"
            >
              Start Shopping
            </Link>
          </section>
        )}

        {/* Bottom reassurance */}
        {orders && orders.length > 0 && (
          <div className="mt-6 rounded-2xl border border-green-100 bg-[#fffdf7] px-4 py-3 text-center text-xs text-gray-500 sm:mt-8">
            Fresh products • Reliable delivery • Simple ordering
          </div>
        )}
      </div>
    </main>
  );
}