"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminInventoryHistory from "@/components/admin-inventory-history";

type Category = {
    id: string;
    name: string;
};

type Product = {
    id: string;
    category_id: string | null;
    name: string;
    sku: string | null;
    stock_quantity: number;
    is_active: boolean;
};

export default function InventoryPage() {
    const supabase = createClient();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStock, setFilterStock] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");

    const [loading, setLoading] = useState(true);
    const [adjusting, setAdjusting] = useState(false);
    const [message, setMessage] = useState("");

    const [stockAdjustProductId, setStockAdjustProductId] =
        useState<string | null>(null);
    const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
    const [adjustmentReason, setAdjustmentReason] = useState("");

    async function loadData() {
        setLoading(true);
        setMessage("");

        const [productsResult, categoriesResult] = await Promise.all([
            supabase
                .from("products")
                .select(
                    "id, category_id, name, sku, stock_quantity, is_active"
                )
                .order("name"),

            supabase
                .from("categories")
                .select("id, name")
                .eq("is_active", true)
                .order("name"),
        ]);

        if (productsResult.error) {
            setMessage(productsResult.error.message);
        } else {
            setProducts(productsResult.data ?? []);
        }

        if (categoriesResult.error) {
            setMessage(categoriesResult.error.message);
        } else {
            setCategories(categoriesResult.data ?? []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function adjustInventory(product: Product) {
        const quantityChange = Number(adjustmentQuantity);
        const reason = adjustmentReason.trim();

        if (!Number.isInteger(quantityChange) || quantityChange === 0) {
            setMessage("Enter a whole number other than zero.");
            return;
        }

        if (reason.length < 3) {
            setMessage("Please enter a reason with at least 3 characters.");
            return;
        }

        if (reason.length > 500) {
            setMessage("Reason cannot exceed 500 characters.");
            return;
        }

        if (product.stock_quantity + quantityChange < 0) {
            setMessage("Stock cannot become negative.");
            return;
        }

        setAdjusting(true);
        setMessage("");

        try {
            const { error } = await supabase.rpc("adjust_inventory", {
                p_product_id: product.id,
                p_quantity_change: quantityChange,
                p_reason: reason,
            });

            if (error) {
                throw new Error(error.message);
            }

            setAdjustmentQuantity("");
            setAdjustmentReason("");
            setStockAdjustProductId(null);

            setMessage(
                `Stock updated successfully for ${product.name}.`
            );

            await loadData();
        } catch (error) {
            console.error(error);

            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to update inventory."
            );
        } finally {
            setAdjusting(false);
        }
    }

    function getCategoryName(categoryId: string | null) {
        if (!categoryId) {
            return "Uncategorized";
        }

        return (
            categories.find((category) => category.id === categoryId)?.name ??
            "Unknown category"
        );
    }

    const filteredProducts = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return products.filter((product) => {
            const matchesSearch =
                !search ||
                product.name.toLowerCase().includes(search) ||
                product.sku?.toLowerCase().includes(search);

            const matchesCategory =
                filterCategory === "all" ||
                product.category_id === filterCategory;

            const matchesStock =
                filterStock === "all" ||
                (filterStock === "in-stock" &&
                    product.stock_quantity > 5) ||
                (filterStock === "low-stock" &&
                    product.stock_quantity > 0 &&
                    product.stock_quantity <= 5) ||
                (filterStock === "out-of-stock" &&
                    product.stock_quantity === 0);

            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [
        products,
        searchTerm,
        filterCategory,
        filterStock,
    ]);

    const totalProducts = products.length;

    const inStockCount = products.filter(
        (product) => product.stock_quantity > 5
    ).length;

    const lowStockCount = products.filter(
        (product) =>
            product.stock_quantity > 0 &&
            product.stock_quantity <= 5
    ).length;

    const outOfStockCount = products.filter(
        (product) => product.stock_quantity === 0
    ).length;

    return (
        <main className="min-h-screen bg-gray-50 p-6 transition-colors dark:bg-[#07140d] md:p-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Inventory
                    </h1>

                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Manage stock levels and inventory movements.
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-100 p-4 text-sm text-gray-700 dark:border-green-900 dark:bg-green-950/60 dark:text-green-100">
                        {message}
                    </div>
                )}

                {/* Summary */}
                <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-transparent bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                        <p className="text-sm text-gray-500 dark:text-green-200/70">
                            Total Products
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                            {totalProducts}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-transparent bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                        <p className="text-sm text-gray-500 dark:text-green-200/70">
                            In Stock
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-700 dark:text-lime-300">
                            {inStockCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-transparent bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                        <p className="text-sm text-gray-500 dark:text-green-200/70">
                            Low Stock
                        </p>

                        <p className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-300">
                            {lowStockCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-transparent bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                        <p className="text-sm text-gray-500 dark:text-green-200/70">
                            Out of Stock
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-300">
                            {outOfStockCount}
                        </p>
                    </div>
                </section>

                {/* Stock Management */}
                <section className="mb-8 rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Stock Management
                        </h2>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                            Adjust inventory without changing product details.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 grid gap-3 md:grid-cols-3">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search by product or SKU"
                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
                        />

                        <select
                            value={filterCategory}
                            onChange={(event) =>
                                setFilterCategory(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
                        >
                            <option value="all">
                                All Categories
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterStock}
                            onChange={(event) =>
                                setFilterStock(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
                        >
                            <option value="all">
                                All Stock
                            </option>

                            <option value="in-stock">
                                In Stock
                            </option>

                            <option value="low-stock">
                                Low Stock
                            </option>

                            <option value="out-of-stock">
                                Out of Stock
                            </option>
                        </select>
                    </div>

                    {/* Products */}
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400">
                            Loading inventory...
                        </p>
                    ) : filteredProducts.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-green-800">
                            <p className="font-medium text-gray-900 dark:text-white">
                                No products match your filters.
                            </p>

                            {products.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterCategory("all");
                                        setFilterStock("all");
                                    }}
                                    className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 dark:text-lime-300 dark:hover:text-lime-200"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredProducts.map((product) => {
                                const isOutOfStock =
                                    product.stock_quantity === 0;

                                const isLowStock =
                                    product.stock_quantity > 0 &&
                                    product.stock_quantity <= 5;

                                return (
                                    <div
                                        key={product.id}
                                        className="rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-green-900 dark:hover:bg-green-900/20"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {product.name}
                                                </h3>

                                                <p className="text-sm text-gray-500 dark:text-green-200/70">
                                                    {getCategoryName(
                                                        product.category_id
                                                    )}
                                                </p>

                                                {product.sku && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        SKU: {product.sku}
                                                    </p>
                                                )}

                                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        Stock:{" "}
                                                        {
                                                            product.stock_quantity
                                                        }
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-2 py-1 text-xs ${isOutOfStock
                                                                ? "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300"
                                                                : isLowStock
                                                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300"
                                                                    : "bg-green-100 text-green-700 dark:bg-green-950/70 dark:text-green-300"
                                                            }`}
                                                    >
                                                        {isOutOfStock
                                                            ? "Out of Stock"
                                                            : isLowStock
                                                                ? "Low Stock"
                                                                : "In Stock"}
                                                    </span>

                                                    {!product.is_active && (
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                            Inactive Product
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStockAdjustProductId(
                                                        stockAdjustProductId ===
                                                            product.id
                                                            ? null
                                                            : product.id
                                                    );
                                                    setAdjustmentQuantity("");
                                                    setAdjustmentReason("");
                                                    setMessage("");
                                                }}
                                                className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/60"
                                            >
                                                {stockAdjustProductId ===
                                                    product.id
                                                    ? "Close"
                                                    : "Adjust Stock"}
                                            </button>
                                        </div>

                                        {stockAdjustProductId ===
                                            product.id && (
                                                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-green-900 dark:bg-green-900/40">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        Adjust Stock
                                                    </h4>

                                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                        Current stock:{" "}
                                                        {
                                                            product.stock_quantity
                                                        }
                                                    </p>

                                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            value={
                                                                adjustmentQuantity
                                                            }
                                                            onChange={(event) =>
                                                                setAdjustmentQuantity(
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Quantity change (+10 or -5)"
                                                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
                                                        />

                                                        <input
                                                            type="text"
                                                            maxLength={500}
                                                            value={
                                                                adjustmentReason
                                                            }
                                                            onChange={(event) =>
                                                                setAdjustmentReason(
                                                                    event.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Reason for adjustment"
                                                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
                                                        />
                                                    </div>

                                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        Use a positive number to add
                                                        stock and a negative number
                                                        to remove stock.
                                                    </p>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                adjustInventory(
                                                                    product
                                                                )
                                                            }
                                                            disabled={adjusting}
                                                            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                                                        >
                                                            {adjusting
                                                                ? "Updating..."
                                                                : "Update Stock"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setStockAdjustProductId(
                                                                    null
                                                                );
                                                                setAdjustmentQuantity(
                                                                    ""
                                                                );
                                                                setAdjustmentReason(
                                                                    ""
                                                                );
                                                            }}
                                                            disabled={adjusting}
                                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:bg-green-950/60 dark:text-green-100 dark:hover:bg-green-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Inventory History */}
                <AdminInventoryHistory />
            </div>
        </main>
    );
}