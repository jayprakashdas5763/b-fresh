import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductImageGallery from "@/components/product-image-gallery";
import type { Metadata } from "next";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        from?: string;
    }>;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    const supabase = await createClient();

    const { data: product } = await supabase
        .from("products")
        .select("name, description, price, unit, is_active")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

    if (!product) {
        return {
            title: "Product Not Found",
            description: "The requested B-Fresh product could not be found.",
        };
    }

    const description =
        product.description?.trim() ||
        `${product.name} available from B-Fresh. Fresh food and dairy products delivered to your doorstep.`;

    return {
        title: product.name,
        description,

        alternates: {
            canonical: `/products/${encodeURIComponent(slug)}`,
        },

        robots: {
            index: true,
            follow: true,
        },

        openGraph: {
            type: "website",
            title: `${product.name} | B-Fresh`,
            description,
        },

        twitter: {
            card: "summary_large_image",
            title: `${product.name} | B-Fresh`,
            description,
        },
    };
}

export default async function ProductPage({
    params,
    searchParams,
}: ProductPageProps) {
    const { slug } = await params;
    const { from } = await searchParams;

    const backHref = from === "cart" ? "/cart" : "/products";
    const backLabel = from === "cart"
        ? "← Back to cart"
        : "← Back to products";
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


    const isOutOfStock = product.stock_quantity <= 0;

    const { data: reviews } = await supabase
        .from("reviews")
        .select(`
        id,
        rating,
        review_text,
        created_at
    `)
        .eq("product_id", product.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

    const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "/",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Products",
                item: "/products",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: product.name,
                item: `/products/${encodeURIComponent(product.slug)}`,
            },
        ],
    };

    const productStructuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description:
            product.description?.trim() ||
            `${product.name} available from B-Fresh.`,
        sku: product.sku || undefined,
        image: images.map((image) => image.image_url),
        offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: Number(product.price).toFixed(2),
            availability: isOutOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            url: `/products/${encodeURIComponent(product.slug)}`,
            seller: {
                "@type": "Organization",
                name: "B-Fresh",
            },
        },
    };

    return (
        <main className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(productStructuredData),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbStructuredData),
                }}
            />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <Link
                    href={backHref}
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                >
                    {backLabel}
                </Link>

                <div className="mt-8 grid gap-10 lg:grid-cols-2">
                    {/* Product Image Gallery */}
                    <ProductImageGallery
                        productName={product.name}
                        images={images}
                    />

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
            <section className="border-t bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Customer Reviews
                        </h2>

                        {reviews && reviews.length > 0 ? (
                            <div className="mt-6 space-y-5">
                                {reviews.map((review) => (
                                    <article
                                        key={review.id}
                                        className="rounded-2xl border bg-white p-5"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    B-Fresh Customer
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {new Date(
                                                        review.created_at
                                                    ).toLocaleDateString("en-IN", {
                                                        dateStyle: "medium",
                                                    })}
                                                </p>
                                            </div>

                                            <div
                                                className="text-lg text-yellow-500"
                                                aria-label={`${review.rating} out of 5 stars`}
                                            >
                                                {"★".repeat(review.rating)}
                                                {"☆".repeat(5 - review.rating)}
                                            </div>
                                        </div>

                                        {review.review_text && (
                                            <p className="mt-4 leading-7 text-gray-600">
                                                {review.review_text}
                                            </p>
                                        )}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-gray-600">
                                No reviews yet. Be the first to share your experience.
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}