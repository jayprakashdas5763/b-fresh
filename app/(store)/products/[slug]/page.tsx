import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductImageGallery from "@/components/product-image-gallery";
import WishlistButton from "@/components/wishlist-button";

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
      description:
        "The requested B-Fresh product could not be found.",
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

function ArrowBackIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l3.293 3.293a1 1 0 0 1 1.414 1.414Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 6h11v10H3z" />
      <path d="M14 9h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="18" cy="18" r="1.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { slug } = await params;
  const { from } = await searchParams;

  const backHref = from === "cart" ? "/cart" : "/products";
  const backLabel =
    from === "cart" ? "Back to cart" : "Back to products";

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

  const hasDiscount =
    product.compare_at_price !== null &&
    Number(product.compare_at_price) > Number(product.price);

  const discountPercentage = hasDiscount
    ? Math.round(
        ((Number(product.compare_at_price) - Number(product.price)) /
          Number(product.compare_at_price)) *
          100
      )
    : 0;

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
        id,
        rating,
        review_text,
        created_at
      `
    )
    .eq("product_id", product.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

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
    <main className="min-h-screen bg-[#f4faef]">
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

      {/* Product */}
      <section className="px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Back */}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-[#fffdf7] px-3.5 py-2 text-xs font-bold text-gray-600 shadow-sm transition hover:bg-green-50 hover:text-green-800 sm:px-4 sm:text-sm"
          >
            <ArrowBackIcon />
            {backLabel}
          </Link>

          <div className="mt-5 grid gap-6 lg:mt-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            {/* Gallery */}
            <div className="overflow-hidden rounded-3xl border border-green-100 bg-[#fffdf7] p-2.5 shadow-sm sm:p-5">
              <ProductImageGallery
                productName={product.name}
                images={images}
              />
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-green-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    B-Fresh
                  </div>

                  <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-gray-950 sm:text-5xl">
                    {product.name}
                  </h1>
                </div>

                <div className="shrink-0">
                  <WishlistButton productId={product.id} />
                </div>
              </div>

              {/* Rating */}
              {reviews && reviews.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div
                    className="text-sm tracking-wide text-amber-500"
                    aria-label={`${averageRating.toFixed(
                      1
                    )} out of 5 stars`}
                  >
                    {"★".repeat(Math.round(averageRating))}
                    {"☆".repeat(5 - Math.round(averageRating))}
                  </div>

                  <span className="text-xs font-semibold text-gray-500 sm:text-sm">
                    {averageRating.toFixed(1)} · {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:mt-5 sm:text-base sm:leading-8">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="mt-5 rounded-3xl border border-green-100 bg-[#fffdf7] p-4 shadow-sm sm:mt-7 sm:p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                        ₹{Number(product.price).toFixed(2)}
                      </span>

                      {hasDiscount && (
                        <span className="text-sm font-medium text-gray-400 line-through sm:text-base">
                          ₹
                          {Number(product.compare_at_price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs font-medium text-gray-500">
                      Price per {product.unit}
                    </p>
                  </div>

                  {hasDiscount && (
                    <span className="rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-green-950">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Status chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {isOutOfStock ? (
                    <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                      Currently unavailable
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
                      ✓ In stock
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
                    <TruckIcon />
                    Local delivery
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
                    <ShieldIcon />
                    Secure ordering
                  </span>
                </div>
              </div>

              {!isOutOfStock && (
                <p className="mt-3 text-xs font-semibold text-gray-500">
                  {product.stock_quantity} available
                </p>
              )}

              {/* Add to cart */}
              {!isOutOfStock && (
                <div className="mt-4 sm:mt-6">
                  <AddToCartButton
                    productId={product.id}
                    stockQuantity={product.stock_quantity}
                  />
                </div>
              )}

              {product.sku && (
                <p className="mt-4 text-[10px] font-medium text-gray-400">
                  SKU: {product.sku}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-green-100 bg-[#fffdf7] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                Customer feedback
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                Reviews
              </h2>
            </div>

            {reviews && reviews.length > 0 && (
              <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-800">
                {averageRating.toFixed(1)} / 5
              </div>
            )}
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2 sm:mt-8 sm:gap-5">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-green-100 bg-[#f8fbf5] p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-gray-950">
                        B-Fresh Customer
                      </p>

                      <p className="mt-1 text-xs font-medium text-gray-400">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                          }
                        )}
                      </p>
                    </div>

                    <div
                      className="rounded-full bg-white px-3 py-1 text-sm tracking-wide text-amber-500 shadow-sm"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                  </div>

                  {review.review_text && (
                    <p className="mt-4 text-sm leading-7 text-gray-600">
                      “{review.review_text}”
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-green-200 bg-green-50/60 px-6 py-12 text-center sm:mt-8 sm:py-14">
              <div className="text-4xl">💚</div>

              <p className="mt-4 text-lg font-black text-gray-950">
                No reviews yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Be the first customer to share your experience.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}