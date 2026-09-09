import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CancelOrderButton from "@/components/cancel-order-button";

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
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-4 text-red-600">{error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Orders
            </h1>

            <p className="mt-2 text-gray-600">
              View your B-Fresh order history.
            </p>
          </div>

          <Link
            href="/products"
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            Shop Now
          </Link>
        </div>

        {orders && orders.length > 0 ? (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <Link
                  href={`/orders/${order.id}`}
                  className="block"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order Number #{order.order_number}
                      </p>

                      <p className="mt-1 font-semibold text-gray-900">
                        {order.id}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : order.status === "refunded"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status.replaceAll("_", " ")}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                        {order.payment_method === "cod"
                          ? "COD"
                          : order.payment_method}
                      </span>

                      <p className="text-lg font-bold text-gray-900">
                        ₹{Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 border-t pt-4 text-sm sm:grid-cols-3">
                    <div>
                      <span className="text-gray-500">
                        Subtotal
                      </span>

                      <p className="mt-1 font-medium text-gray-900">
                        ₹{Number(order.subtotal).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Delivery
                      </span>

                      <p className="mt-1 font-medium text-gray-900">
                        ₹{Number(order.delivery_fee).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <span className="text-gray-500">
                        Payment
                      </span>

                      <p className="mt-1 font-medium capitalize text-gray-900">
                        {order.payment_status}
                      </p>
                    </div>
                  </div>
                </Link>

                {[
                  "pending",
                  "confirmed",
                  "processing",
                  "packed",
                ].includes(order.status) && (
                  <div className="mt-5 border-t pt-5">
                    <CancelOrderButton orderId={order.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-600">
              Your completed orders will appear here.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}