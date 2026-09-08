"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = {
    id: string;
    name: string;
};

type Product = {
    id: string;
    category_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    unit: string;
    stock_quantity: number;
    sku: string | null;
    is_active: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ProductsPage() {
    const supabase = createClient();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [unit, setUnit] = useState("piece");
    const [stockQuantity, setStockQuantity] = useState("");
    const [sku, setSku] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    function createSlug(value: string) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    async function loadData() {
        setLoading(true);
        setMessage("");

        const [categoriesResult, productsResult] = await Promise.all([
            supabase
                .from("categories")
                .select("id, name")
                .eq("is_active", true)
                .order("name"),

            supabase
                .from("products")
                .select(
                    "id, category_id, name, slug, description, price, compare_at_price, unit, stock_quantity, sku, is_active"
                )
                .order("created_at", { ascending: false }),
        ]);

        if (categoriesResult.error) {
            setMessage(categoriesResult.error.message);
        } else {
            setCategories(categoriesResult.data ?? []);
        }

        if (productsResult.error) {
            setMessage(productsResult.error.message);
        } else {
            setProducts(productsResult.data ?? []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    function handleImageChange(file: File | null) {
        if (!file) {
            setImageFile(null);
            setImagePreview("");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setMessage("Please select an image file.");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setMessage("Image must be smaller than 5 MB.");
            return;
        }

        setMessage("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const productName = name.trim();
        const productPrice = Number(price);
        const productStock = Number(stockQuantity);
        const productComparePrice = compareAtPrice
            ? Number(compareAtPrice)
            : null;

        if (!productName) {
            setMessage("Product name is required.");
            return;
        }

        if (!categoryId) {
            setMessage("Please select a category.");
            return;
        }

        if (!Number.isFinite(productPrice) || productPrice < 0) {
            setMessage("Enter a valid product price.");
            return;
        }

        if (!Number.isInteger(productStock) || productStock < 0) {
            setMessage("Enter a valid stock quantity.");
            return;
        }

        if (
            productComparePrice !== null &&
            (!Number.isFinite(productComparePrice) || productComparePrice < 0)
        ) {
            setMessage("Enter a valid original price.");
            return;
        }

        setSaving(true);
        setMessage("");

        let createdProductId: string | null = null;
        let uploadedPath: string | null = null;

        try {
            const slug = createSlug(productName);

            const { data: product, error: productError } = await supabase
                .from("products")
                .insert({
                    category_id: categoryId,
                    name: productName,
                    slug,
                    description: description.trim() || null,
                    price: productPrice,
                    compare_at_price: productComparePrice,
                    unit: unit.trim() || "piece",
                    stock_quantity: productStock,
                    sku: sku.trim() || null,
                })
                .select("id")
                .single();

            if (productError) {
                throw new Error(productError.message);
            }

            createdProductId = product.id;

            if (imageFile) {
                const extension =
                    imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

                uploadedPath = `${product.id}/${crypto.randomUUID()}.${extension}`;

                const { error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(uploadedPath, imageFile, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: imageFile.type,
                    });

                if (uploadError) {
                    throw new Error(uploadError.message);
                }

                const {
                    data: { publicUrl },
                } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(uploadedPath);

                const { error: imageRecordError } = await supabase
                    .from("product_images")
                    .insert({
                        product_id: product.id,
                        image_url: publicUrl,
                        alt_text: productName,
                        sort_order: 0,
                    });

                if (imageRecordError) {
                    throw new Error(imageRecordError.message);
                }
            }

            setName("");
            setCategoryId("");
            setDescription("");
            setPrice("");
            setCompareAtPrice("");
            setUnit("piece");
            setStockQuantity("");
            setSku("");
            setImageFile(null);
            setImagePreview("");

            setMessage(
                imageFile
                    ? "Product and image created successfully."
                    : "Product created successfully."
            );

            await loadData();
        } catch (error) {
            console.error(error);

            // Remove uploaded image if a later step failed.
            if (uploadedPath) {
                await supabase.storage.from("product-images").remove([uploadedPath]);
            }

            // Remove product if image processing failed after product creation.
            if (createdProductId) {
                await supabase
                    .from("products")
                    .delete()
                    .eq("id", createdProductId);
            }

            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while creating the product."
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggleProduct(product: Product) {
        const { error } = await supabase
            .from("products")
            .update({
                is_active: !product.is_active,
            })
            .eq("id", product.id);

        if (error) {
            setMessage(error.message);
            return;
        }

        await loadData();
    }

    async function deleteProduct(id: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("Product deleted.");
        await loadData();
    }

    function getCategoryName(categoryId: string | null) {
        if (!categoryId) return "Uncategorized";

        return (
            categories.find((category) => category.id === categoryId)?.name ??
            "Unknown category"
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Products</h1>

                    <p className="mt-2 text-gray-600">
                        Manage the B-Fresh product catalog and inventory.
                    </p>
                </div>

                <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold">Add Product</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Product name"
                            required
                            className="w-full rounded-lg border p-3"
                        />

                        <select
                            value={categoryId}
                            onChange={(event) => setCategoryId(event.target.value)}
                            required
                            className="w-full rounded-lg border p-3"
                        >
                            <option value="">Select category</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Product description"
                            rows={4}
                            className="w-full rounded-lg border p-3"
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                placeholder="Selling price (₹)"
                                required
                                className="w-full rounded-lg border p-3"
                            />

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={compareAtPrice}
                                onChange={(event) => setCompareAtPrice(event.target.value)}
                                placeholder="Original price (optional)"
                                className="w-full rounded-lg border p-3"
                            />

                            <input
                                type="text"
                                value={unit}
                                onChange={(event) => setUnit(event.target.value)}
                                placeholder="Unit (e.g. 1 litre, 500 g, piece)"
                                required
                                className="w-full rounded-lg border p-3"
                            />

                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={stockQuantity}
                                onChange={(event) => setStockQuantity(event.target.value)}
                                placeholder="Stock quantity"
                                required
                                className="w-full rounded-lg border p-3"
                            />

                            <input
                                type="text"
                                value={sku}
                                onChange={(event) => setSku(event.target.value)}
                                placeholder="SKU (optional)"
                                className="w-full rounded-lg border p-3"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Product Image
                            </label>

                            <label
                                htmlFor="product-image"
                                className="inline-flex cursor-pointer items-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Choose Image
                            </label>

                            <input
                                id="product-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) =>
                                    handleImageChange(event.target.files?.[0] ?? null)
                                }
                                className="hidden"
                            />

                            {imageFile && (
                                <span className="ml-3 text-sm text-gray-600">
                                    {imageFile.name}
                                </span>
                            )}

                            {imagePreview && (
                                <div className="mt-4">
                                    <img
                                        src={imagePreview}
                                        alt="Product preview"
                                        className="h-40 w-40 rounded-xl border object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
                        >
                            {saving ? "Creating product..." : "Add Product"}
                        </button>
                    </form>

                    {message && (
                        <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm">
                            {message}
                        </p>
                    )}
                </section>

                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold">Products</h2>

                    {loading ? (
                        <p className="text-gray-500">Loading products...</p>
                    ) : products.length === 0 ? (
                        <p className="text-gray-500">No products yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {products.map((product) => (
                                <div key={product.id} className="rounded-xl border p-4">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h3 className="font-semibold">{product.name}</h3>

                                            <p className="text-sm text-gray-500">
                                                {getCategoryName(product.category_id)}
                                            </p>

                                            <p className="mt-1">
                                                ₹{Number(product.price).toFixed(2)} / {product.unit}
                                            </p>

                                            <p className="text-sm text-gray-600">
                                                Stock: {product.stock_quantity}
                                            </p>

                                            {product.sku && (
                                                <p className="text-sm text-gray-500">
                                                    SKU: {product.sku}
                                                </p>
                                            )}

                                            <span
                                                className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${product.is_active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {product.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleProduct(product)}
                                                className="rounded-lg border px-3 py-2 text-sm"
                                            >
                                                {product.is_active ? "Deactivate" : "Activate"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => deleteProduct(product.id)}
                                                className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}