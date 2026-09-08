"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Order = {
    id: string;
    order_number: number;
    user_id: string;
    status: string;
    payment_method: string;
    payment_status: string;
    subtotal: number;
    delivery_fee: number;
    discount_amount: number;
    total_amount: number;
    shipping_full_name: string;
    shipping_phone: string;
    shipping_address_line1: string;
    shipping_address_line2: string | null;
    shipping_landmark: string | null;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    customer_note: string | null;
    admin_note: string | null;
    created_at: string;
};

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "packed",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
];

export default function AdminOrdersPage() {
    const supabase = createClient();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    async function loadOrders() {
        setLoading(true);
        setMessage("");

        const { data, error } = await supabase
            .from("orders")
            .select(`
        id,
        order_number,
        user_id,
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
        customer_note,
        admin_note,
        created_at
      `)
            .order("created_at", { ascending: false });

        if (error) {
            setMessage(error.message);
        } else {
            setOrders((data ?? []) as Order[]);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadOrders();
    }, []);

    async function updateStatus(orderId: string, status: string) {
        setSavingId(orderId);
        setMessage("");

        const { error } = await supabase
            .from("orders")
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

        if (error) {
            setMessage(error.message);
        } else {
            setOrders((current) =>
                current.map((order) =>
                    order.id === orderId
                        ? { ...order, status }
                        : order
                )
            );
        }

        setSavingId(null);
    }

    function formatStatus(status: string) {
        return status
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join(" ");
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Orders
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Manage incoming B-Fresh orders.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadOrders}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Refresh
                    </button>
                </div>

                {message && (
                    <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="mt-8 rounded-2xl bg-white p-8 text-center">
                        <p className="text-gray-600">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center">
                        <h2 className="text-xl font-semibold text-gray-900">
                            No orders yet
                        </h2>

                        <p className="mt-2 text-gray-600">
                            New customer orders will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 space-y-5">
                        {orders.map((order) => (
                            <section
                                key={order.id}
                                className="rounded-2xl bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    {/* Order info */}
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-xl font-semibold text-gray-900 hover:text-green-700"
                                            >
                                                Order #{order.order_number}
                                            </Link>

                                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                                                {formatStatus(order.status)}
                                            </span>

                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                {order.payment_method.toUpperCase()}
                                            </span>
                                        </div>

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

                                    {/* Status */}
                                    <div className="w-full lg:w-64">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Update Status
                                        </label>

                                        <select
                                            value={order.status}
                                            disabled={savingId === order.id}
                                            onChange={(event) =>
                                                updateStatus(
                                                    order.id,
                                                    event.target.value
                                                )
                                            }
                                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option key={status} value={status}>
                                                    {formatStatus(status)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-6 border-t pt-6 lg:grid-cols-3">
                                    {/* Customer */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Customer
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            {order.shipping_full_name}
                                            <br />
                                            Phone: {order.shipping_phone}
                                        </p>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Delivery Address
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            {order.shipping_address_line1}
                                            {order.shipping_address_line2
                                                ? `, ${order.shipping_address_line2}`
                                                : ""}
                                            {order.shipping_landmark
                                                ? `, ${order.shipping_landmark}`
                                                : ""}
                                            <br />
                                            {order.shipping_city},{" "}
                                            {order.shipping_state} -{" "}
                                            {order.shipping_postal_code}
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Payment
                                        </h3>

                                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>
                                                    ₹{Number(order.subtotal).toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Delivery</span>
                                                <span>
                                                    ₹{Number(order.delivery_fee).toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Discount</span>
                                                <span>
                                                    ₹
                                                    {Number(
                                                        order.discount_amount
                                                    ).toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex justify-between border-t pt-2 font-semibold text-gray-900">
                                                <span>Total</span>
                                                <span>
                                                    ₹{Number(order.total_amount).toFixed(2)}
                                                </span>
                                            </div>

                                            <p className="pt-1 capitalize">
                                                Payment status:{" "}
                                                {order.payment_status}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {(order.customer_note || order.admin_note) && (
                                    <div className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-2">
                                        {order.customer_note && (
                                            <div className="rounded-xl bg-gray-50 p-4">
                                                <h3 className="font-semibold text-gray-900">
                                                    Customer Note
                                                </h3>

                                                <p className="mt-2 text-sm text-gray-600">
                                                    {order.customer_note}
                                                </p>
                                            </div>
                                        )}

                                        {order.admin_note && (
                                            <div className="rounded-xl bg-gray-50 p-4">
                                                <h3 className="font-semibold text-gray-900">
                                                    Admin Note
                                                </h3>

                                                <p className="mt-2 text-sm text-gray-600">
                                                    {order.admin_note}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}