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
      `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !product) {
    notFound();
  }

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  const isOutOfStock = product.stock_quantity <= 0;

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
        id,
        rating,
        review_text,
        created_at
      `,
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
    <main className="min-h-screen bg-[#f5faef]">
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

      {/* Product area */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb / back */}
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-green-50 hover:text-green-800"
          >
            <ArrowBackIcon />
            {backLabel}
          </Link>

          <div className="mt-7 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            {/* Gallery */}
            <div className="rounded-[2rem] border border-green-100 bg-white p-3 shadow-sm sm:p-5">
              <ProductImageGallery
                productName={product.name}
                images={images}
              />
            </div>

            {/* Product details */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-green-800">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                B-Fresh
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-gray-950 sm:text-5xl">
                {product.name}
              </h1>

              {reviews && reviews.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <div
                    className="text-base tracking-wide text-amber-500"
                    aria-label={`${averageRating.toFixed(1)} out of 5 stars`}
                  >
                    {"★".repeat(Math.round(averageRating))}
                    {"☆".repeat(5 - Math.round(averageRating))}
                  </div>

                  <span className="text-sm font-medium text-gray-500">
                    {averageRating.toFixed(1)} · {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}

              {product.description && (
                <p className="mt-5 max-w-xl text-base leading-8 text-gray-600">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="mt-7 rounded-3xl border border-green-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-black tracking-tight text-gray-950">
                    ₹{Number(product.price).toFixed(2)}
                  </span>

                  {product.compare_at_price &&
                    product.compare_at_price > product.price && (
                      <span className="pb-1 text-base font-medium text-gray-400 line-through">
                        ₹
                        {Number(
                          product.compare_at_price,
                        ).toFixed(2)}
                      </span>
                    )}
                </div>

                <p className="mt-1 text-sm font-medium text-gray-500">
                  Price per {product.unit}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {isOutOfStock ? (
                    <span className="rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700">
                      Currently unavailable
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-3.5 py-1.5 text-xs font-bold text-green-800">
                      ✓ In stock
                    </span>
                  )}

                  <span className="rounded-full bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-600">
                    🚚 Local delivery
                  </span>

                  <span className="rounded-full bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-gray-600">
                    🔒 Secure ordering
                  </span>
                </div>
              </div>

              {/* Stock */}
              {!isOutOfStock && (
                <p className="mt-4 text-sm font-medium text-gray-500">
                  {product.stock_quantity} available
                </p>
              )}

              {/* CTA */}
              {!isOutOfStock && (
                <div className="mt-6">
                  <AddToCartButton
                    productId={product.id}
                    stockQuantity={product.stock_quantity}
                  />
                </div>
              )}

              {product.sku && (
                <p className="mt-5 text-xs font-medium text-gray-400">
                  SKU: {product.sku}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-green-100 bg-white px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                Customer feedback
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-gray-950">
                Reviews
              </h2>
            </div>

            {reviews && reviews.length > 0 && (
              <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-800">
                {averageRating.toFixed(1)} / 5
              </div>
            )}
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-gray-100 bg-[#f8fbf5] p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-gray-950">
                        B-Fresh Customer
                      </p>

                      <p className="mt-1 text-xs font-medium text-gray-400">
                        {new Date(
                          review.created_at,
                        ).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
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
                    <p className="mt-5 text-sm leading-7 text-gray-600">
                      “{review.review_text}”
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-green-200 bg-green-50/60 px-6 py-14 text-center">
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