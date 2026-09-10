import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CategoryCard from "@/components/category-card";
import ProductCard from "@/components/product-card";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Fresh Food & Dairy Delivery in Odisha",
  description:
    "Shop fresh dairy products, healthy food, groceries, and everyday essentials from B-Fresh. Convenient local delivery across our service area in Odisha.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "B-Fresh | Fresh Food & Dairy Delivered",
    description:
      "Shop fresh dairy products, healthy food, groceries, and everyday essentials from B-Fresh.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "B-Fresh | Fresh Food & Dairy Delivered",
    description:
      "Shop fresh dairy products, healthy food, groceries, and everyday essentials from B-Fresh.",
  },
};

const benefits = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M3 12h13" />
        <path d="M13 6h5l3 4v6h-2" />
        <path d="M3 7h10v10H3z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    ),
    title: "Local Delivery",
    description: "Fresh essentials delivered conveniently within our service area.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M12 3v18" />
        <path d="M17 7.5c0-2-2.2-3.5-5-3.5s-5 1.5-5 3.5 2.2 3.5 5 3.5 5 1.5 5 3.5-2.2 3.5-5 3.5-5-1.5-5-3.5" />
      </svg>
    ),
    title: "Fair Pricing",
    description: "Quality products with clear pricing and no unnecessary complexity.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Quality First",
    description: "Thoughtfully selected products for your everyday needs.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: products },
    { data: heroProductRows },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, description, image_url")
      .eq("is_active", true)
      .order("name")
      .limit(6),

    supabase
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
      product_images (
        image_url,
        alt_text,
        sort_order
      )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("product_images")
      .select(
        `
      image_url,
      alt_text,
      sort_order,
      products!inner (
        id,
        name,
        is_active
      )
      `
      )
      .eq("products.is_active", true)
      .order("sort_order", { ascending: true })
      .limit(1),
  ]);

  const heroImageRow = heroProductRows?.[0];

  const heroImage = heroImageRow?.image_url;

  const heroProduct = heroImageRow?.products?.[0];
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "B-Fresh",
        description:
          "Fresh food, dairy products, groceries, and everyday essentials delivered locally.",
      },
      {
        "@type": "WebSite",
        name: "B-Fresh",
        description:
          "Fresh food and quality dairy products delivered to your doorstep.",
        potentialAction: {
          "@type": "SearchAction",
          target: "/products?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main className="overflow-hidden bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-green-50 via-white to-lime-50">
        <div className="absolute -left-32 -top-32 -z-10 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute -bottom-32 right-0 -z-10 h-80 w-80 rounded-full bg-lime-200/30 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          {/* Hero copy */}
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 text-sm font-semibold text-green-800 shadow-sm backdrop-blur">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              Fresh • Healthy • Local
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl xl:text-7xl">
              Good food.
              <span className="block text-green-700">
                Freshly delivered.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              Discover fresh dairy, healthy food, groceries, and everyday
              essentials — carefully selected and delivered to your doorstep.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-700/20 transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                Shop Fresh Products
                <svg
                  className="ml-2 h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>

              <a
                href="#categories"
                className="inline-flex items-center justify-center rounded-full border border-green-200 bg-white px-6 py-3 text-sm font-semibold text-green-800 shadow-sm transition hover:-translate-y-0.5 hover:border-green-300 hover:bg-green-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                Explore Categories
              </a>
            </div>

            {/* Trust row */}
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-gray-200/80 pt-7">
              <div>
                <p className="text-xl font-bold text-gray-900">Fresh</p>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Everyday essentials
                </p>
              </div>

              <div className="border-l border-gray-200 pl-4">
                <p className="text-xl font-bold text-gray-900">Local</p>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Delivery focused
                </p>
              </div>

              <div className="border-l border-gray-200 pl-4">
                <p className="text-xl font-bold text-gray-900">Simple</p>
                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Easy shopping
                </p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="relative aspect-square">
              <div className="absolute inset-8 rounded-full bg-green-200/50 blur-2xl" />

              <div className="absolute inset-5 overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-3 shadow-2xl shadow-green-900/10 backdrop-blur">
                <div className="relative h-full overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-green-100 via-lime-50 to-white">
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={heroProduct?.name ?? "Fresh B-Fresh product"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-8xl">🥛</div>
                        <p className="mt-4 text-sm font-semibold text-green-800">
                          Fresh every day
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-lg backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                      Fresh pick
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="truncate font-bold text-gray-900">
                        {heroProduct?.name ?? "Fresh essentials"}
                      </p>

                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                        B-Fresh
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute left-0 top-10 hidden rounded-2xl border border-white bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                    🥬
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fresh choices</p>
                    <p className="font-bold text-gray-900">
                      Every day
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 right-0 hidden rounded-2xl border border-white bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                    🚚
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivered</p>
                    <p className="font-bold text-gray-900">
                      Locally
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-start gap-4 rounded-2xl px-3 py-4 transition hover:bg-green-50/70"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                {benefit.icon}
              </div>

              <div>
                <h2 className="font-semibold text-gray-900">
                  {benefit.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-green-700">
              <span className="h-px w-6 bg-green-600" />
              Shop by category
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
              Everything you need,
              <span className="block text-gray-500">
                in one fresh place.
              </span>
            </h2>
          </div>

          <Link
            href="/products"
            className="hidden shrink-0 text-sm font-semibold text-green-700 transition hover:text-green-800 sm:inline-flex sm:items-center"
          >
            View all
            <span className="ml-1">→</span>
          </Link>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <div key={category.id}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-gray-500">
              Categories will appear here soon.
            </p>
          </div>
        )}
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-gray-50/80">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-green-700">
                <span className="h-px w-6 bg-green-600" />
                Fresh picks
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                Popular right now
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                A few of our latest products, selected for your everyday
                shopping.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-green-200 hover:bg-green-50 sm:block"
            >
              View all products
            </Link>
          </div>

          {products && products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
              <p className="text-gray-500">
                Products will appear here once you add them from the admin
                dashboard.
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-green-700 px-6 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Browse all products →
            </Link>
          </div>
        </div>
      </section>

      {/* WHY B-FRESH */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-green-700">
              <span className="h-px w-6 bg-green-600" />
              Why B-Fresh
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
              Fresh shopping,
              <span className="block text-green-700">
                made simple.
              </span>
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-gray-600">
              We are building B-Fresh around a simple idea: make it easier
              to get quality everyday food and dairy products without making
              shopping complicated.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex min-h-11 items-center rounded-xl border border-green-200 bg-green-50 px-5 text-sm font-semibold text-green-800 transition hover:bg-green-100"
            >
              Start shopping →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-green-50 p-7">
              <div className="text-3xl">🥛</div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Fresh Dairy
              </h3>
              <p className="mt-2 leading-6 text-gray-600">
                Everyday dairy essentials for your home.
              </p>
            </div>

            <div className="rounded-3xl bg-lime-50 p-7">
              <div className="text-3xl">🥗</div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Healthy Choices
              </h3>
              <p className="mt-2 leading-6 text-gray-600">
                Products chosen with quality and everyday health in mind.
              </p>
            </div>

            <div className="rounded-3xl bg-amber-50 p-7">
              <div className="text-3xl">🛍️</div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Easy Shopping
              </h3>
              <p className="mt-2 leading-6 text-gray-600">
                Find what you need and place your order without the hassle.
              </p>
            </div>

            <div className="rounded-3xl bg-blue-50 p-7">
              <div className="text-3xl">📦</div>
              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Local Service
              </h3>
              <p className="mt-2 leading-6 text-gray-600">
                Convenient delivery designed around our local service area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-green-700 px-6 py-12 text-center shadow-2xl shadow-green-900/10 sm:px-10 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
              Your everyday fresh store
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Bring fresh choices home.
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-green-50/90">
              Browse our products and discover something fresh for your next
              order.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-7 text-sm font-bold text-green-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50"
            >
              Explore B-Fresh
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}