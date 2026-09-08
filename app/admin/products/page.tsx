"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminProductImages from "@/components/admin-product-images";

type Category = {
    id: string;
    name: string;
};

type ProductImage = {
    id: string;
    product_id: string;
    image_url: string;
    alt_text: string | null;
    sort_order: number;
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
    product_images: ProductImage[];
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function ProductsPage() {
    const supabase = createClient();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterStock, setFilterStock] = useState("all");

    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [unit, setUnit] = useState("piece");
    const [stockQuantity, setStockQuantity] = useState("");
    const [sku, setSku] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

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

    function getStoragePathFromUrl(imageUrl: string) {
        const marker = "/storage/v1/object/public/product-images/";
        const index = imageUrl.indexOf(marker);

        if (index === -1) {
            return null;
        }

        return imageUrl.slice(index + marker.length);
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
                .select(`
                    id,
                    category_id,
                    name,
                    slug,
                    description,
                    price,
                    compare_at_price,
                    unit,
                    stock_quantity,
                    sku,
                    is_active,
                    product_images (
                        id,
                        product_id,
                        image_url,
                        alt_text,
                        sort_order
                    )
                `)
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

    function startEdit(product: Product) {
        setEditingId(product.id);
        setName(product.name);
        setCategoryId(product.category_id ?? "");
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setCompareAtPrice(
            product.compare_at_price !== null
                ? String(product.compare_at_price)
                : ""
        );
        setUnit(product.unit);
        setStockQuantity(String(product.stock_quantity));
        setSku(product.sku ?? "");

        setImageFile(null);
        setImagePreview("");
        setMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedSku = sku.trim().toUpperCase();

        if (normalizedSku) {
            if (!/^[A-Z0-9_-]{2,50}$/.test(normalizedSku)) {
                setMessage(
                    "SKU must be 2–50 characters and contain only letters, numbers, hyphens, or underscores."
                );
                return;
            }

            const duplicateSku = products.find(
                (product) =>
                    product.sku?.toUpperCase() === normalizedSku &&
                    product.id !== editingId
            );

            if (duplicateSku) {
                setMessage("This SKU is already used by another product.");
                return;
            }
        }
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

            let product;

            if (editingId) {
                const { data: updatedProduct, error: updateError } =
                    await supabase
                        .from("products")
                        .update({
                            category_id: categoryId,
                            name: productName,
                            slug,
                            description: description.trim() || null,
                            price: productPrice,
                            compare_at_price: productComparePrice,
                            unit: unit.trim() || "piece",
                            stock_quantity: productStock,
                            sku: normalizedSku  || null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", editingId)
                        .select("id")
                        .single();

                if (updateError) {
                    throw new Error(updateError.message);
                }

                product = updatedProduct;
            } else {
                const { data: createdProduct, error: productError } =
                    await supabase
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
                            sku: normalizedSku  || null,
                        })
                        .select("id")
                        .single();

                if (productError) {
                    throw new Error(productError.message);
                }

                product = createdProduct;
            }

            if (!editingId) {
                createdProductId = product.id;
            }

            if (imageFile) {
                const extension =
                    imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

                const newStoragePath =
                    `${product.id}/${crypto.randomUUID()}.${extension}`;

                const { error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(newStoragePath, imageFile, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: imageFile.type,
                    });

                if (uploadError) {
                    throw new Error(uploadError.message);
                }

                uploadedPath = newStoragePath;

                const {
                    data: { publicUrl },
                } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(newStoragePath);

                if (editingId) {
                    const {
                        data: existingImage,
                        error: existingImageError,
                    } = await supabase
                        .from("product_images")
                        .select("id, image_url")
                        .eq("product_id", product.id)
                        .eq("sort_order", 0)
                        .maybeSingle();

                    if (existingImageError) {
                        throw new Error(existingImageError.message);
                    }

                    if (existingImage) {
                        const { error: imageUpdateError } = await supabase
                            .from("product_images")
                            .update({
                                image_url: publicUrl,
                                alt_text: productName,
                            })
                            .eq("id", existingImage.id);

                        if (imageUpdateError) {
                            throw new Error(imageUpdateError.message);
                        }

                        const oldStoragePath = getStoragePathFromUrl(
                            existingImage.image_url
                        );

                        if (oldStoragePath) {
                            const { error: removeError } =
                                await supabase.storage
                                    .from("product-images")
                                    .remove([oldStoragePath]);

                            if (removeError) {
                                console.error(
                                    "Unable to remove old image:",
                                    removeError.message
                                );
                            }
                        }
                    } else {
                        const { error: imageInsertError } = await supabase
                            .from("product_images")
                            .insert({
                                product_id: product.id,
                                image_url: publicUrl,
                                alt_text: productName,
                                sort_order: 0,
                            });

                        if (imageInsertError) {
                            throw new Error(imageInsertError.message);
                        }
                    }
                } else {
                    const { error: imageInsertError } = await supabase
                        .from("product_images")
                        .insert({
                            product_id: product.id,
                            image_url: publicUrl,
                            alt_text: productName,
                            sort_order: 0,
                        });

                    if (imageInsertError) {
                        throw new Error(imageInsertError.message);
                    }
                }
            }

            const wasEditing = Boolean(editingId);

            setEditingId(null);
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
                wasEditing
                    ? imageFile
                        ? "Product and image updated successfully."
                        : "Product updated successfully."
                    : imageFile
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

    const filteredProducts = products.filter((product) => {
        const search = searchTerm.trim().toLowerCase();

        const matchesSearch =
            !search ||
            product.name.toLowerCase().includes(search) ||
            product.sku?.toLowerCase().includes(search) ||
            product.slug.toLowerCase().includes(search);

        const matchesCategory =
            filterCategory === "all" ||
            product.category_id === filterCategory;

        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && product.is_active) ||
            (filterStatus === "inactive" && !product.is_active);

        const matchesStock =
            filterStock === "all" ||
            (filterStock === "in-stock" && product.stock_quantity > 5) ||
            (filterStock === "low-stock" &&
                product.stock_quantity > 0 &&
                product.stock_quantity <= 5) ||
            (filterStock === "out-of-stock" &&
                product.stock_quantity === 0);

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus &&
            matchesStock
        );
    });

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
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">
                            {editingId ? "Edit Product" : "Add Product"}
                        </h2>

                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
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
                                    setMessage("");
                                }}
                                className="text-sm font-medium text-gray-500 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

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

                            {editingId && (
                                <AdminProductImages
                                    productId={editingId}
                                    productName={name}
                                    images={
                                        products.find((product) => product.id === editingId)
                                            ?.product_images ?? []
                                    }
                                    onImagesChanged={loadData}
                                />
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
                        >
                            {saving
                                ? editingId
                                    ? "Updating product..."
                                    : "Creating product..."
                                : editingId
                                    ? "Update Product"
                                    : "Add Product"}
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
                    <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search by name or SKU"
                            className="rounded-lg border border-gray-300 p-3 text-gray-900"
                        />

                        <select
                            value={filterCategory}
                            onChange={(event) =>
                                setFilterCategory(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                        >
                            <option value="all">All Categories</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(event) =>
                                setFilterStatus(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <select
                            value={filterStock}
                            onChange={(event) =>
                                setFilterStock(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                        >
                            <option value="all">All Stock</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>

                    {loading ? (
                        <p className="text-gray-500">Loading products...</p>
                    ) : filteredProducts.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center">
                            <p className="font-medium text-gray-900">
                                {products.length === 0
                                    ? "No products yet."
                                    : "No products match your filters."}
                            </p>

                            {products.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterCategory("all");
                                        setFilterStatus("all");
                                        setFilterStock("all");
                                    }}
                                    className="mt-3 text-sm font-medium text-green-700 hover:text-green-800"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredProducts.map((product) => (

                                <div
                                    key={product.id}
                                    className="rounded-xl border p-4"
                                >
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        {/* Product info */}
                                        <div className="flex min-w-0 gap-4">
                                            {/* Product image */}
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                                {product.product_images?.length > 0 ? (
                                                    <img
                                                        src={
                                                            [...product.product_images].sort(
                                                                (a, b) =>
                                                                    a.sort_order - b.sort_order
                                                            )[0]?.image_url
                                                        }
                                                        alt={
                                                            [...product.product_images].sort(
                                                                (a, b) =>
                                                                    a.sort_order - b.sort_order
                                                            )[0]?.alt_text ??
                                                            product.name
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <span className="text-2xl">🥛</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product details */}
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900">
                                                    {product.name}
                                                </h3>

                                                <p className="text-sm text-gray-500">
                                                    {getCategoryName(product.category_id)}
                                                </p>

                                                <p className="mt-1 text-gray-900">
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
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(product)}
                                                className="rounded-lg border px-3 py-2 text-sm"
                                            >
                                                Edit
                                            </button>

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