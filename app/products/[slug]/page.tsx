import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/add-to-cart-button";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;

    const supabase = await createClient();

    const { data: product, error } = await supabase
        .from("products")
        .select(
            `
        id,
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
          image_url,
          alt_text,
          sort_order
        )
      `
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

    if (error || !product) {
        notFound();
    }

    const images = [...(product.product_images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order
    );

    const primaryImage = images[0];

    const isOutOfStock = product.stock_quantity <= 0;

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href="/products"
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                >
                    ← Back to products
                </Link>

                <div className="mt-8 grid gap-10 lg:grid-cols-2">
                    {/* Product Image */}
                    <div className="overflow-hidden rounded-2xl bg-gray-100">
                        {primaryImage ? (
                            <img
                                src={primaryImage.image_url}
                                alt={primaryImage.alt_text || product.name}
                                className="aspect-square h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex aspect-square items-center justify-center">
                                <span className="text-7xl">🥛</span>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col justify-center">
                        <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                            B-Fresh
                        </p>

                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900">
                            {product.name}
                        </h1>

                        {product.description && (
                            <p className="mt-5 text-lg leading-8 text-gray-600">
                                {product.description}
                            </p>
                        )}

                        <div className="mt-6 flex items-end gap-3">
                            <span className="text-3xl font-bold text-gray-900">
                                ₹{Number(product.price).toFixed(2)}
                            </span>

                            {product.compare_at_price &&
                                product.compare_at_price > product.price && (
                                    <span className="text-lg text-gray-400 line-through">
                                        ₹{Number(product.compare_at_price).toFixed(2)}
                                    </span>
                                )}
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                            Price per {product.unit}
                        </p>

                        <div className="mt-6">
                            {isOutOfStock ? (
                                <span className="inline-block rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
                                    Out of stock
                                </span>
                            ) : (
                                <span className="inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                                    In stock · {product.stock_quantity} available
                                </span>
                            )}
                        </div>

                        {product.sku && (
                            <p className="mt-4 text-sm text-gray-500">
                                SKU: {product.sku}
                            </p>
                        )}

                        {!isOutOfStock && (
                            <div className="mt-8">
                                <AddToCartButton
                                    productId={product.id}
                                    stockQuantity={product.stock_quantity}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}