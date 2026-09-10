"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type InventoryAdjustment = {
    id: string;
    product_id: string;
    user_id: string;
    quantity_change: number;
    previous_quantity: number;
    new_quantity: number;
    reason: string;
    created_at: string;
};

type Product = {
    id: string;
    name: string;
    sku: string | null;
};

type Profile = {
    id: string;
    full_name: string | null;
};

export default function AdminInventoryHistory() {
    const supabase = createClient();

    const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    async function loadHistory() {
        setLoading(true);
        setMessage("");

        const { data, error } = await supabase
            .from("inventory_adjustments")
            .select(
                "id, product_id, user_id, quantity_change, previous_quantity, new_quantity, reason, created_at"
            )
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        const history = data ?? [];
        setAdjustments(history);

        const productIds = [
            ...new Set(history.map((item) => item.product_id)),
        ];

        const userIds = [
            ...new Set(history.map((item) => item.user_id)),
        ];

        if (productIds.length > 0) {
            const { data: productData, error: productError } = await supabase
                .from("products")
                .select("id, name, sku")
                .in("id", productIds);

            if (productError) {
                setMessage(productError.message);
            } else {
                setProducts(productData ?? []);
            }
        } else {
            setProducts([]);
        }

        if (userIds.length > 0) {
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", userIds);

            if (profileError) {
                setMessage(profileError.message);
            } else {
                setProfiles(profileData ?? []);
            }
        } else {
            setProfiles([]);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadHistory();
    }, []);

    function getProduct(productId: string) {
        return products.find((product) => product.id === productId);
    }

    function getProfile(userId: string) {
        return profiles.find((profile) => profile.id === userId);
    }

    function formatDate(value: string) {
        return new Date(value).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    return (
        <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        Inventory History
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Recent stock adjustments made by admins.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadHistory}
                    disabled={loading}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {message && (
                <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {message}
                </p>
            )}

            {loading ? (
                <p className="text-gray-500">Loading inventory history...</p>
            ) : adjustments.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                    <p className="font-medium text-gray-900">
                        No inventory adjustments yet.
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Stock changes made through Adjust Stock will appear here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-gray-500">
                                <th className="px-3 py-3 font-medium">Date</th>
                                <th className="px-3 py-3 font-medium">Product</th>
                                <th className="px-3 py-3 font-medium">
                                    Previous
                                </th>
                                <th className="px-3 py-3 font-medium">
                                    Change
                                </th>
                                <th className="px-3 py-3 font-medium">New</th>
                                <th className="px-3 py-3 font-medium">Reason</th>
                                <th className="px-3 py-3 font-medium">Admin</th>
                            </tr>
                        </thead>

                        <tbody>
                            {adjustments.map((adjustment) => {
                                const product = getProduct(adjustment.product_id);
                                const profile = getProfile(adjustment.user_id);

                                return (
                                    <tr
                                        key={adjustment.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <td className="whitespace-nowrap px-3 py-4 text-gray-600">
                                            {formatDate(adjustment.created_at)}
                                        </td>

                                        <td className="px-3 py-4">
                                            <div className="font-medium text-gray-900">
                                                {product?.name ?? "Unknown Product"}
                                            </div>

                                            {product?.sku && (
                                                <div className="text-xs text-gray-500">
                                                    SKU: {product.sku}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-3 py-4 text-gray-700">
                                            {adjustment.previous_quantity}
                                        </td>

                                        <td className="px-3 py-4">
                                            <span
                                                className={
                                                    adjustment.quantity_change > 0
                                                        ? "font-semibold text-green-700"
                                                        : "font-semibold text-red-600"
                                                }
                                            >
                                                {adjustment.quantity_change > 0
                                                    ? `+${adjustment.quantity_change}`
                                                    : adjustment.quantity_change}
                                            </span>
                                        </td>

                                        <td className="px-3 py-4 font-medium text-gray-900">
                                            {adjustment.new_quantity}
                                        </td>

                                        <td className="max-w-xs px-3 py-4 text-gray-600">
                                            <span className="break-words">
                                                {adjustment.reason}
                                            </span>
                                        </td>

                                        <td className="px-3 py-4 text-gray-600">
                                            {profile?.full_name ??
                                                "Admin"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}