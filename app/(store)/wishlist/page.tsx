import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type WishlistProductImage = {
    image_url: string;
    alt_text: string | null;
    sort_order: number;
};

type WishlistProduct = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    unit: string;
    stock_quantity: number;
    is_active: boolean;
    product_images?: WishlistProductImage[];
};

type WishlistItem = {
    id: string;
    product_id: string;
    created_at: string;
    products: WishlistProduct | null;
};

export default async function WishlistPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth?next=/wishlist");
    }

    const { data, error } = await supabase
        .from("wishlists")
        .select(
            `
            id,
            product_id,
            created_at,
            products (
                id,
                name,
                slug,
                description,
                price,
                compare_at_price,
                unit,
                stock_quantity,
                is_active,
                product_images (
                    image_url,
                    alt_text,
                    sort_order
                )
            )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Wishlist error:", error.message);
    }

    const items: WishlistItem[] = (data ?? []).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        products: item.products?.[0] ?? null,
    }));

    const activeItems = items.filter(
        (item) => item.products?.is_active === true
    );

    return (
        <main className="min-h-screen bg-white">
            <section className="border-b bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                    >
                        ← Continue shopping
                    </Link>

                    <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                        My Wishlist
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Products you want to keep for later.
                    </p>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {activeItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-12 text-center">
                        <div className="text-5xl">♡</div>

                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                            Your wishlist is empty
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Save products you like and come back to them later.
                        </p>

                        <Link
                            href="/products"
                            className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
                        >
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-sm text-gray-500">
                                {activeItems.length}{" "}
                                {activeItems.length === 1
                                    ? "item"
                                    : "items"}{" "}
                                saved
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {activeItems.map((item) => {
                                const product = item.products;

                                if (!product) {
                                    return null;
                                }

                                const images = [
                                    ...(product.product_images ?? []),
                                ].sort(
                                    (a, b) => a.sort_order - b.sort_order
                                );

                                const primaryImage = images[0];
                                const isOutOfStock =
                                    product.stock_quantity <= 0;

                                return (
                                    <article
                                        key={item.id}
                                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <Link
                                            href={`/products/${encodeURIComponent(
                                                product.slug
                                            )}`}
                                        >
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                {primaryImage ? (
                                                    <img
                                                        src={
                                                            primaryImage.image_url
                                                        }
                                                        alt={
                                                            primaryImage.alt_text ||
                                                            product.name
                                                        }
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <span className="text-5xl">
                                                            🥛
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">
                                                    {product.name}
                                                </h2>

                                                {product.description && (
                                                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                                                        {product.description}
                                                    </p>
                                                )}

                                                <div className="mt-4 flex items-end justify-between gap-3">
                                                    <div>
                                                        <p className="text-lg font-bold text-gray-900">
                                                            ₹
                                                            {Number(
                                                                product.price
                                                            ).toFixed(2)}
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            per {product.unit}
                                                        </p>
                                                    </div>

                                                    {product.compare_at_price !==
                                                        null &&
                                                        product.compare_at_price >
                                                        product.price && (
                                                            <p className="text-sm text-gray-400 line-through">
                                                                ₹
                                                                {Number(
                                                                    product.compare_at_price
                                                                ).toFixed(2)}
                                                            </p>
                                                        )}
                                                </div>

                                                <div className="mt-4">
                                                    {isOutOfStock ? (
                                                        <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                                            Out of stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                            In stock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}