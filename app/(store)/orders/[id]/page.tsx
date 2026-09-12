import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OrderReceipt from "@/components/order-receipt";
import CancelOrderButton from "@/components/cancel-order-button";
import ReviewForm from "@/components/review-form";

export const metadata: Metadata = {
  title: "Order Details",
  description:
    "View your B-Fresh order details, payment status, delivery information, and receipt.",
  robots: {
    index: false,
    follow: false,
  },
};

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusSteps = [
  {
    key: "pending",
    label: "Order Placed",
    description: "We've received your order.",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Your order has been confirmed.",
  },
  {
    key: "processing",
    label: "Processing",
    description: "We're preparing your items.",
  },
  {
    key: "packed",
    label: "Packed",
    description: "Your order is packed and ready.",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your order is on its way.",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order delivered successfully.",
  },
] as const;

const cancellableStatuses = [
  "pending",
  "confirmed",
  "processing",
  "packed",
];

function getCurrentStepIndex(status: string) {
  return statusSteps.findIndex((step) => step.key === status);
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900";
    case "refunded":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900";
    case "out_for_delivery":
      return "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-950/50 dark:text-lime-300 dark:border-lime-900";
    case "confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900";
    case "processing":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900";
    case "packed":
      return "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900";
  }
}

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
            razorpay_refund_id,
            refund_status,
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
                product_id,
                product_name,
                unit,
                unit_price,
                quantity,
                total_price
            )
            `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const orderItems = order.order_items ?? [];
  const currentStepIndex = getCurrentStepIndex(order.status);
  const isTerminalState =
    order.status === "cancelled" || order.status === "refunded";
  const canCancel = cancellableStatuses.includes(order.status);

  return (
    <main className="min-h-screen bg-[#f4faef] px-4 py-8 transition-colors dark:bg-[#07140d] sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-2 text-sm text-gray-500 dark:text-green-200/60">
          <Link
            href="/orders"
            className="font-medium text-green-700 transition hover:text-green-800 dark:text-lime-300 dark:hover:text-lime-200"
          >
            My Orders
          </Link>

          <span>/</span>

          <span>Order #{order.order_number}</span>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-green-100 bg-[#fffdf7] shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-lime-200/40 blur-3xl dark:bg-lime-900/20" />
          <div className="absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-green-200/30 blur-3xl dark:bg-green-900/20" />

          <div className="relative px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 dark:bg-green-950 dark:text-lime-300">
                  <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-lime-400" />
                  B-Fresh Order
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                  Order #{order.order_number}
                </h1>

                <p className="mt-2 text-sm text-gray-600 dark:text-green-200/70">
                  Thank you for choosing B-Fresh.
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-green-200/50">
                  Placed on{" "}
                  {new Date(
                    order.created_at,
                  ).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 sm:items-end">
                <span
                  className={`inline-flex rounded-full border px-3.5 py-2 text-xs font-bold ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {order.status === "delivered"
                    ? "✓ Delivered"
                    : formatStatus(order.status)}
                </span>

                <p className="text-2xl font-black text-green-800 dark:text-lime-300">
                  ₹{Number(order.total_amount).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <OrderReceipt
                order={{
                  orderNumber: order.order_number,
                  createdAt: order.created_at,
                  status: order.status,
                  paymentMethod: order.payment_method,
                  paymentStatus: order.payment_status,
                  customerName:
                    order.shipping_full_name,
                  phone: order.shipping_phone,
                  addressLine1:
                    order.shipping_address_line1,
                  addressLine2:
                    order.shipping_address_line2,
                  landmark: order.shipping_landmark,
                  city: order.shipping_city,
                  state: order.shipping_state,
                  postalCode:
                    order.shipping_postal_code,
                  items: orderItems,
                  subtotal: Number(order.subtotal),
                  deliveryFee: Number(
                    order.delivery_fee,
                  ),
                  discountAmount: Number(
                    order.discount_amount,
                  ),
                  totalAmount: Number(
                    order.total_amount,
                  ),
                }}
              />

              {canCancel && (
                <CancelOrderButton
                  orderId={order.id}
                  paymentMethod={order.payment_method}
                  paymentStatus={order.payment_status}
                />
              )}
            </div>
          </div>
        </section>

        {/* Terminal status */}
        {isTerminalState ? (
          <section
            className={`mt-6 rounded-3xl border p-5 shadow-sm transition-colors sm:p-7 ${order.status === "cancelled"
              ? "border-red-100 bg-red-50 dark:border-red-900/70 dark:bg-red-950/40"
              : "border-purple-100 bg-purple-50 dark:border-purple-900/70 dark:bg-purple-950/40"
              }`}
          >
            <div className="flex gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${order.status === "cancelled"
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  }`}
              >
                {order.status === "cancelled" ? "×" : "↻"}
              </div>

              <div>
                <h2
                  className={`text-lg font-bold ${order.status === "cancelled"
                    ? "text-red-900 dark:text-red-200"
                    : "text-purple-900 dark:text-purple-200"
                    }`}
                >
                  {order.status === "cancelled"
                    ? "This order was cancelled"
                    : "This order was refunded"}
                </h2>

                <p
                  className={`mt-1 text-sm leading-6 ${order.status === "cancelled"
                    ? "text-red-700 dark:text-red-300"
                    : "text-purple-700 dark:text-purple-300"
                    }`}
                >
                  {order.status === "cancelled"
                    ? "The order will not be delivered."
                    : "The payment associated with this order has been refunded."}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-[2rem] border border-green-100 bg-[#fffdf7] p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  Order Status
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-green-200/70">
                  Follow your order from placement to
                  delivery.
                </p>
              </div>

              <div className="hidden rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 dark:bg-green-950 dark:text-lime-300 sm:block">
                Freshness in progress
              </div>
            </div>

            <div className="mt-7">
              {/* Mobile timeline */}
              <div className="space-y-0 sm:hidden">
                {statusSteps.map((step, index) => {
                  const completed =
                    currentStepIndex >= index;
                  const current =
                    currentStepIndex === index;
                  const isLast =
                    index === statusSteps.length - 1;

                  return (
                    <div
                      key={step.key}
                      className="flex"
                    >
                      <div className="flex w-10 shrink-0 flex-col items-center">
                        <div
                          className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${completed
                            ? "bg-green-700 text-white dark:bg-green-600"
                            : "bg-green-50 text-gray-400 ring-1 ring-green-100 dark:bg-green-950/60 dark:text-green-200/40 dark:ring-green-900"
                            }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        {!isLast && (
                          <div
                            className={`h-12 w-0.5 ${currentStepIndex >
                              index
                              ? "bg-green-600 dark:bg-green-500"
                              : "bg-green-100 dark:bg-green-900"
                              }`}
                          />
                        )}
                      </div>

                      <div className="pb-6 pl-4">
                        <p
                          className={`text-sm font-bold ${current
                            ? "text-green-800 dark:text-lime-300"
                            : completed
                              ? "text-gray-800 dark:text-green-100"
                              : "text-gray-400 dark:text-green-200/40"
                            }`}
                        >
                          {step.label}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-green-200/60">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop timeline */}
              <div className="hidden sm:flex sm:items-start">
                {statusSteps.map((step, index) => {
                  const completed =
                    currentStepIndex >= index;
                  const current =
                    currentStepIndex === index;
                  const isLast =
                    index === statusSteps.length - 1;

                  return (
                    <div
                      key={step.key}
                      className="flex min-w-0 flex-1 items-start"
                    >
                      <div className="min-w-0 flex-1 text-center">
                        <div
                          className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 text-sm font-bold shadow-sm ${completed
                            ? "border-[#fffdf7] bg-green-700 text-white dark:border-green-950/70 dark:bg-green-600"
                            : "border-[#fffdf7] bg-green-50 text-gray-400 ring-1 ring-green-100 dark:border-green-950/70 dark:bg-green-950/60 dark:text-green-200/40 dark:ring-green-900"
                            }`}
                        >
                          {completed
                            ? "✓"
                            : index + 1}
                        </div>

                        <p
                          className={`mt-3 text-xs font-bold ${current
                            ? "text-green-800 dark:text-lime-300"
                            : completed
                              ? "text-gray-800 dark:text-green-100"
                              : "text-gray-400 dark:text-green-200/40"
                            }`}
                        >
                          {step.label}
                        </p>

                        <p className="mx-auto mt-1 max-w-[110px] text-[11px] leading-4 text-gray-500 dark:text-green-200/60">
                          {step.description}
                        </p>
                      </div>

                      {!isLast && (
                        <div
                          className={`mt-5 h-0.5 w-8 shrink-0 ${currentStepIndex >
                            index
                            ? "bg-green-600 dark:bg-green-500"
                            : "bg-green-100 dark:bg-green-900"
                            }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Delivery + Payment */}
        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-[2rem] border border-green-100 bg-[#fffdf7] p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-lg dark:bg-green-950">
                📍
              </div>

              <div>
                <h2 className="font-black text-gray-900 dark:text-white">
                  Delivery Address
                </h2>

                <p className="text-xs text-gray-500 dark:text-green-200/60">
                  Where your order will arrive
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-green-50/70 p-4 text-sm leading-6 text-gray-700 dark:bg-green-900/40 dark:text-green-100/80">
              <p className="font-bold text-gray-900 dark:text-white">
                {order.shipping_full_name}
              </p>

              <p>
                {order.shipping_address_line1}
                {order.shipping_address_line2
                  ? `, ${order.shipping_address_line2}`
                  : ""}
                {order.shipping_landmark
                  ? `, ${order.shipping_landmark}`
                  : ""}
              </p>

              <p>
                {order.shipping_city},{" "}
                {order.shipping_state} -{" "}
                {order.shipping_postal_code}
              </p>

              <p className="mt-2 font-medium text-gray-600 dark:text-green-200/60">
                Phone: {order.shipping_phone}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-green-100 bg-[#fffdf7] p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-lg dark:bg-lime-950">
                💳
              </div>

              <div>
                <h2 className="font-black text-gray-900 dark:text-white">
                  Payment
                </h2>

                <p className="text-xs text-gray-500 dark:text-green-200/60">
                  Payment and order information
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-green-50/70 p-4 dark:bg-green-900/40">
              <p className="font-bold capitalize text-gray-900 dark:text-white">
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : order.payment_method}
              </p>

              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${order.payment_status === "paid"
                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                  : order.payment_status ===
                    "refunded"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    : order.payment_status === "failed"
                      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
              >
                {order.payment_status === "paid"
                  ? "Payment Paid"
                  : order.payment_status === "refunded"
                    ? "Payment Refunded"
                    : order.payment_status === "failed"
                      ? "Payment Failed"
                      : "Payment Pending"}
              </span>

              <p className="mt-3 text-sm leading-5 text-gray-600 dark:text-green-200/70">
                {order.payment_status === "paid"
                  ? "Payment has been received."
                  : order.payment_method === "cod"
                    ? "Pay when your order is delivered."
                    : "Payment is pending."}
              </p>
            </div>
          </div>
        </section>

        {/* Items */}
        <section className="mt-6 rounded-[2rem] border border-green-100 bg-[#fffdf7] p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 sm:p-7">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Order Items
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-green-200/60">
              {orderItems.length}{" "}
              {orderItems.length === 1
                ? "item"
                : "items"}{" "}
              in this order
            </p>
          </div>

          <div className="mt-5 divide-y divide-green-100 overflow-hidden rounded-2xl border border-green-100 dark:divide-green-900 dark:border-green-900">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 bg-white/50 p-4 dark:bg-green-950/40 sm:p-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900 dark:text-white">
                    {item.product_name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-green-200/60">
                    {item.quantity} × ₹
                    {Number(
                      item.unit_price,
                    ).toFixed(2)}
                    {item.unit
                      ? ` / ${item.unit}`
                      : ""}
                  </p>
                </div>

                <p className="shrink-0 font-bold text-gray-900 dark:text-white">
                  ₹
                  {Number(
                    item.total_price,
                  ).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Review */}
        {order.status === "delivered" && (
          <section className="mt-6 rounded-[2rem] border border-green-100 bg-[#fffdf7] p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 sm:p-7">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Share Your Experience
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-green-200/60">
                Tell us what you thought about the products in
                your order.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {orderItems.map((item) =>
                item.product_id ? (
                  <ReviewForm
                    key={item.id}
                    orderId={order.id}
                    productId={item.product_id}
                    productName={item.product_name}
                  />
                ) : null,
              )}
            </div>
          </section>
        )}

        {/* Order Summary */}
        <section className="mt-6 rounded-[2rem] border border-green-100 bg-[#fffdf7] p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 sm:p-7">
          <div className="ml-auto max-w-sm">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              Order Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-green-200/70">
                  Subtotal
                </span>

                <span className="font-medium text-gray-900 dark:text-white">
                  ₹
                  {Number(
                    order.subtotal,
                  ).toFixed(2)}
                </span>
              </div>

              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600 dark:text-green-200/70">
                    Discount
                  </span>

                  <span className="font-medium text-green-700 dark:text-lime-300">
                    -₹
                    {Number(
                      order.discount_amount,
                    ).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-green-200/70">
                  Delivery
                </span>

                <span className="font-medium text-gray-900 dark:text-white">
                  ₹
                  {Number(
                    order.delivery_fee,
                  ).toFixed(2)}
                </span>
              </div>

              <div className="border-t border-green-100 pt-4 dark:border-green-900">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    Total
                  </span>

                  <span className="text-2xl font-black text-green-800 dark:text-lime-300">
                    ₹
                    {Number(
                      order.total_amount,
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-2xl bg-green-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 hover:shadow-md dark:bg-green-700 dark:hover:bg-green-600"
          >
            Continue Shopping
          </Link>

          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-2xl border border-green-200 bg-[#fffdf7] px-6 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-green-50 dark:border-green-800 dark:bg-green-950/70 dark:text-green-100 dark:hover:bg-green-900"
          >
            My Account
          </Link>
        </div>
      </div>
    </main>
  );
}