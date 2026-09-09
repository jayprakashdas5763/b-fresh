import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderReceipt from "@/components/order-receipt";
import CancelOrderButton from "@/components/cancel-order-button";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage({
  params,
}: OrderPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      payment_method,
      payment_status,
      subtotal,
      delivery_fee,
      discount_amount,
      total_amount,
      shipping_full_name,
      shipping_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_landmark,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      created_at,
      order_items (
        id,
        product_name,
        unit,
        unit_price,
        quantity,
        total_price
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const orderItems = order.order_items ?? [];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
              ✓
            </div>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              Order Placed Successfully
            </h1>

            <p className="mt-2 text-gray-600">
              Thank you for ordering from B-Fresh.
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Order ID:{" "}
              <span className="font-medium text-gray-900">
                {order.id}
              </span>
            </p>
            <div className="mt-4">
              <span
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${order.status === "delivered"
                  ? "bg-green-100 text-green-800"
                  : order.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : order.status === "refunded"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {order.status === "delivered"
                  ? "✓ Delivered"
                  : order.status
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (char: string) => char.toUpperCase())}
              </span>
            </div>

            {/* Download Receipt */}
            <div className="mt-4 flex justify-center">
              <OrderReceipt
                order={{
                  orderNumber: order.order_number,
                  createdAt: order.created_at,
                  status: order.status,
                  paymentMethod: order.payment_method,
                  paymentStatus: order.payment_status,
                  customerName: order.shipping_full_name,
                  phone: order.shipping_phone,
                  addressLine1: order.shipping_address_line1,
                  addressLine2: order.shipping_address_line2,
                  landmark: order.shipping_landmark,
                  city: order.shipping_city,
                  state: order.shipping_state,
                  postalCode: order.shipping_postal_code,
                  items: orderItems,
                  subtotal: Number(order.subtotal),
                  deliveryFee: Number(order.delivery_fee),
                  discountAmount: Number(order.discount_amount),
                  totalAmount: Number(order.total_amount),
                }}
              />
            </div>
            {["pending", "confirmed", "processing", "packed"].includes(
              order.status
            ) && (
                <div className="mt-3 flex justify-center">
                  <CancelOrderButton orderId={order.id} />
                </div>
              )}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* Delivery */}
            <section className="rounded-xl border p-5">
              <h2 className="font-semibold text-gray-900">
                Delivery Address
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {order.shipping_full_name}
                <br />
                {order.shipping_address_line1}
                {order.shipping_address_line2
                  ? `, ${order.shipping_address_line2}`
                  : ""}
                {order.shipping_landmark
                  ? `, ${order.shipping_landmark}`
                  : ""}
                <br />
                {order.shipping_city}, {order.shipping_state} -{" "}
                {order.shipping_postal_code}
                <br />
                Phone: {order.shipping_phone}
              </p>
            </section>

            {/* Payment */}
            <section className="rounded-xl border p-5">
              <h2 className="font-semibold text-gray-900">
                Payment
              </h2>

              <p className="mt-3 text-sm text-gray-600">
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : order.payment_method}
              </p>

              <div
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${order.payment_status === "paid"
                  ? "bg-green-100 text-green-800"
                  : order.payment_status === "refunded"
                    ? "bg-purple-100 text-purple-800"
                    : order.payment_status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {order.payment_status === "paid"
                  ? "Payment Paid"
                  : order.payment_status === "refunded"
                    ? "Payment Refunded"
                    : order.payment_status === "failed"
                      ? "Payment Failed"
                      : "Payment Pending"}
              </div>

              <p className="mt-3 text-sm text-gray-600">
                {order.payment_status === "paid"
                  ? "Payment has been received."
                  : order.payment_method === "cod"
                    ? "Pay when your order is delivered."
                    : "Payment is pending."}
              </p>
            </section>
          </div>

          {/* Items */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Items
            </h2>

            <div className="mt-4 divide-y rounded-xl border">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product_name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.quantity} × ₹
                      {Number(item.unit_price).toFixed(2)}
                      {item.unit ? ` / ${item.unit}` : ""}
                    </p>
                  </div>

                  <p className="font-medium text-gray-900">
                    ₹{Number(item.total_price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Total */}
          <section className="mt-8 ml-auto max-w-sm">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{Number(order.subtotal).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>
                  ₹{Number(order.delivery_fee).toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    ₹{Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/products"
              className="rounded-lg bg-green-700 px-6 py-3 text-center font-medium text-white hover:bg-green-800"
            >
              Continue Shopping
            </Link>

            <Link
              href="/account"
              className="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              My Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}