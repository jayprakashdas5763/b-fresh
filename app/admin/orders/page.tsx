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

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
    const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");

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

        const currentOrder = orders.find(
            (order) => order.id === orderId
        );

        if (!currentOrder) {
            setMessage("Order not found.");
            setSavingId(null);
            return;
        }

        const updateData: {
            status: string;
            updated_at: string;
            payment_status?: string;
        } = {
            status,
            updated_at: new Date().toISOString(),
        };

        // COD payment is collected when the order is delivered.
        if (
            currentOrder.payment_method === "cod" &&
            status === "delivered" &&
            currentOrder.payment_status === "pending"
        ) {
            updateData.payment_status = "paid";
        }

        // Only mark a COD order as refunded when it was previously paid.
        if (
            currentOrder.payment_method === "cod" &&
            status === "refunded" &&
            currentOrder.payment_status === "paid"
        ) {
            updateData.payment_status = "refunded";
        }

        const { error } = await supabase
            .from("orders")
            .update(updateData)
            .eq("id", orderId);

        if (error) {
            setMessage(error.message);
        } else {
            setOrders((current) =>
                current.map((order) =>
                    order.id === orderId
                        ? {
                              ...order,
                              status,
                              payment_status:
                                  updateData.payment_status ??
                                  order.payment_status,
                          }
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

    const filteredOrders = orders.filter((order) => {
        const search = searchTerm.trim().toLowerCase();

        const matchesSearch =
            !search ||
            order.order_number.toString().includes(search) ||
            order.shipping_full_name.toLowerCase().includes(search) ||
            order.shipping_phone.includes(search);

        const matchesStatus =
            filterStatus === "all" || order.status === filterStatus;

        const matchesPaymentMethod =
            filterPaymentMethod === "all" ||
            order.payment_method === filterPaymentMethod;

        const matchesPaymentStatus =
            filterPaymentStatus === "all" ||
            order.payment_status === filterPaymentStatus;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPaymentMethod &&
            matchesPaymentStatus
        );
    });

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 transition-colors dark:bg-[#07140d] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Orders
                        </h1>

                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Manage incoming B-Fresh orders.
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <input
                            type="text"
                            placeholder="Search order, customer, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
                        />

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
                        >
                            <option value="all">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="out_for_delivery">
                                Out for delivery
                            </option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                        </select>

                        <select
                            value={filterPaymentMethod}
                            onChange={(e) =>
                                setFilterPaymentMethod(e.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
                        >
                            <option value="all">All payment methods</option>
                            <option value="cod">COD</option>
                            <option value="razorpay">Razorpay</option>
                        </select>

                        <select
                            value={filterPaymentStatus}
                            onChange={(e) =>
                                setFilterPaymentStatus(e.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
                        >
                            <option value="all">All payment statuses</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setFilterStatus("all");
                                setFilterPaymentMethod("all");
                                setFilterPaymentStatus("all");
                            }}
                            className="text-sm font-medium text-green-700 hover:underline dark:text-lime-300"
                        >
                            Clear filters
                        </button>

                        <button
                            type="button"
                            onClick={loadOrders}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-green-800 dark:bg-green-950/70 dark:text-green-100 dark:hover:bg-green-900"
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300">
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="mt-8 rounded-2xl bg-white p-8 text-center dark:bg-green-950/70">
                        <p className="text-gray-600 dark:text-green-200">
                            Loading orders...
                        </p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-green-800 dark:bg-green-950/70">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            No orders yet
                        </h2>

                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            New customer orders will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 space-y-5">
                        {filteredOrders.map((order) => (
                            <section
                                key={order.id}
                                className="rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-xl font-semibold text-gray-900 hover:text-green-700 dark:text-white dark:hover:text-lime-300"
                                            >
                                                Order #{order.order_number}
                                            </Link>

                                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300">
                                                {formatStatus(order.status)}
                                            </span>

                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-green-900 dark:text-green-100">
                                                {order.payment_method.toUpperCase()}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(
                                                order.created_at
                                            ).toLocaleString("en-IN", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>

                                    <div className="w-full lg:w-64">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-green-100">
                                            Update Status
                                        </label>

                                        <select
                                            value={order.status}
                                            disabled={
                                                savingId === order.id
                                            }
                                            onChange={(event) =>
                                                updateStatus(
                                                    order.id,
                                                    event.target.value
                                                )
                                            }
                                            className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:opacity-60 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
                                        >
                                            {ORDER_STATUSES.map(
                                                (status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {formatStatus(status)}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-6 border-t border-gray-200 pt-6 dark:border-green-900 lg:grid-cols-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Customer
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            {order.shipping_full_name}
                                            <br />
                                            Phone: {order.shipping_phone}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Delivery Address
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
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

                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Payment
                                        </h3>

                                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>
                                                    ₹
                                                    {Number(
                                                        order.subtotal
                                                    ).toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span>Delivery</span>
                                                <span>
                                                    ₹
                                                    {Number(
                                                        order.delivery_fee
                                                    ).toFixed(2)}
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

                                            <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900 dark:border-green-900 dark:text-white">
                                                <span>Total</span>
                                                <span>
                                                    ₹
                                                    {Number(
                                                        order.total_amount
                                                    ).toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="pt-2">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Payment status:
                                                </span>{" "}
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                        order.payment_status ===
                                                        "paid"
                                                            ? "bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300"
                                                            : order.payment_status ===
                                                                "failed"
                                                              ? "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300"
                                                              : order.payment_status ===
                                                                  "refunded"
                                                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300"
                                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300"
                                                    }`}
                                                >
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(order.customer_note ||
                                    order.admin_note) && (
                                    <div className="mt-6 grid gap-4 border-t border-gray-200 pt-6 dark:border-green-900 md:grid-cols-2">
                                        {order.customer_note && (
                                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-green-900/40">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    Customer Note
                                                </h3>

                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                    {order.customer_note}
                                                </p>
                                            </div>
                                        )}

                                        {order.admin_note && (
                                            <div className="rounded-xl bg-gray-50 p-4 dark:bg-green-900/40">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    Admin Note
                                                </h3>

                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
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