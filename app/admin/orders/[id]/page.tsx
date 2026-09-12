import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminOrderNotes from "@/components/admin-order-notes";

type AdminOrderPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function AdminOrderPage({
    params,
}: AdminOrderPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    const { data: order, error } = await supabase
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
            created_at,
            updated_at,
            order_items (
                id,
                product_id,
                product_name,
                product_sku,
                unit,
                quantity,
                unit_price,
                total_price,
                created_at
            )
        `)
        .eq("id", id)
        .single();

    if (error || !order) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-8 transition-colors dark:bg-[#07140d] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/admin/orders"
                    className="text-sm font-medium text-green-700 hover:text-green-800 dark:text-lime-300 dark:hover:text-lime-200"
                >
                    ← Back to Orders
                </Link>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Order #{order.order_number}
                        </h1>

                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(
                                order.created_at
                            ).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium capitalize text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300">
                            {order.status.replaceAll("_", " ")}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium uppercase text-gray-700 dark:bg-green-900 dark:text-green-100">
                            {order.payment_method}
                        </span>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                            {order.payment_status}
                        </span>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    {/* Customer */}
                    <section className="rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Customer
                        </h2>

                        <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            <span className="font-medium text-gray-900 dark:text-white">
                                {order.shipping_full_name}
                            </span>
                            <br />
                            Phone: {order.shipping_phone}
                        </p>

                        <p className="mt-3 break-all text-xs text-gray-400 dark:text-gray-500">
                            User ID: {order.user_id}
                        </p>
                    </section>

                    {/* Delivery */}
                    <section className="rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Delivery Address
                        </h2>

                        <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
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
                            {order.shipping_city},{" "}
                            {order.shipping_state} -{" "}
                            {order.shipping_postal_code}
                            <br />
                            Phone: {order.shipping_phone}
                        </p>
                    </section>

                    {/* Amount */}
                    <section className="rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Order Total
                        </h2>

                        <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
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

                            <div className="border-t border-gray-200 pt-3 dark:border-green-900">
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span>
                                        ₹
                                        {Number(
                                            order.total_amount
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Order items */}
                <section className="mt-6 rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Order Items
                    </h2>

                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-gray-200 text-left text-sm text-gray-500 dark:border-green-900 dark:text-green-200/70">
                                    <th className="pb-3 pr-4 font-medium">
                                        Product
                                    </th>
                                    <th className="pb-3 pr-4 font-medium">
                                        SKU
                                    </th>
                                    <th className="pb-3 pr-4 font-medium">
                                        Unit
                                    </th>
                                    <th className="pb-3 pr-4 text-right font-medium">
                                        Qty
                                    </th>
                                    <th className="pb-3 pr-4 text-right font-medium">
                                        Unit Price
                                    </th>
                                    <th className="pb-3 text-right font-medium">
                                        Total
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {order.order_items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-gray-200 last:border-0 dark:border-green-900/70"
                                    >
                                        <td className="py-4 pr-4 font-medium text-gray-900 dark:text-white">
                                            {item.product_name}
                                        </td>

                                        <td className="py-4 pr-4 text-sm text-gray-600 dark:text-gray-300">
                                            {item.product_sku || "—"}
                                        </td>

                                        <td className="py-4 pr-4 text-sm text-gray-600 dark:text-gray-300">
                                            {item.unit}
                                        </td>

                                        <td className="py-4 pr-4 text-right text-sm text-gray-600 dark:text-gray-300">
                                            {item.quantity}
                                        </td>

                                        <td className="py-4 pr-4 text-right text-sm text-gray-600 dark:text-gray-300">
                                            ₹
                                            {Number(
                                                item.unit_price
                                            ).toFixed(2)}
                                        </td>

                                        <td className="py-4 text-right font-medium text-gray-900 dark:text-white">
                                            ₹
                                            {Number(
                                                item.total_price
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Notes */}
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {/* Customer note */}
                    <section className="rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Customer Note
                        </h2>

                        {order.customer_note ? (
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                                {order.customer_note}
                            </p>
                        ) : (
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                No customer note.
                            </p>
                        )}
                    </section>

                    {/* Admin note */}
                    <AdminOrderNotes
                        orderId={order.id}
                        initialNote={order.admin_note}
                    />
                </div>
            </div>
        </main>
    );
}