import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CategoryCard from "@/components/category-card";
import ProductCard from "@/components/product-card";

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
    number: "01",
    title: "Fresh selection",
    description:
      "Everyday food, dairy and essentials selected with freshness in mind.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M12 21c4.4-3.1 7-6.6 7-11A7 7 0 0 0 5 10c0 4.4 2.6 7.9 7 11Z" />
        <path d="M12 18V8" />
        <path d="M8.5 11.5c1.5-.1 2.7.4 3.5 1.5" />
        <path d="M15.5 10.5c-1.5-.1-2.7.4-3.5 1.5" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Local delivery",
    description:
      "Convenient delivery focused on serving our local community.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Simple shopping",
    description:
      "A straightforward shopping experience without unnecessary complexity.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M3 4h2l2.3 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L21 8H6" />
      </svg>
    ),
  },
];

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L14.586 11H3a1 1 0 1 1 0-2h11.586l-4.293-4.293a1 1 0 0 1 0-1.414Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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
        `,
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
        `,
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

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate overflow-hidden bg-[#f4faef]">
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-green-200/50 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-lime-200/50 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[18%] top-[15%] h-24 w-24 rounded-full border border-green-200/50"
          aria-hidden="true"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-20">
          {/* Left */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-green-800 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
              </span>
              Freshness starts here
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-black tracking-[-0.04em] text-gray-950 sm:text-6xl lg:text-7xl xl:text-[5.1rem] xl:leading-[1.02]">
              Better food.
              <span className="mt-1 block text-green-700">
                Better everyday.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              Fresh dairy, healthy food, groceries and everyday essentials —
              carefully selected and brought closer to home.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="group inline-flex min-h-12 items-center justify-center rounded-full bg-green-700 px-6 text-sm font-bold text-white shadow-xl shadow-green-800/15 transition duration-300 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                Shop fresh products
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowIcon />
                </span>
              </Link>

              <a
                href="#categories"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-green-200 bg-white/90 px-6 text-sm font-bold text-green-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-green-300 hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                Explore categories
              </a>
            </div>

            {/* Trust chips */}
            <div className="mt-9 flex flex-wrap gap-2">
              <span className="rounded-full border border-green-100 bg-white/75 px-3 py-1.5 text-xs font-semibold text-gray-700">
                ✓ Fresh selections
              </span>
              <span className="rounded-full border border-green-100 bg-white/75 px-3 py-1.5 text-xs font-semibold text-gray-700">
                ✓ Local delivery
              </span>
              <span className="rounded-full border border-green-100 bg-white/75 px-3 py-1.5 text-xs font-semibold text-gray-700">
                ✓ Easy ordering
              </span>
            </div>

            {/* Mini stats */}
            <div className="mt-10 grid max-w-xl grid-cols-3 border-t border-green-200/80 pt-6">
              <div className="pr-4">
                <p className="text-lg font-black text-gray-950 sm:text-xl">
                  Fresh
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  Everyday essentials
                </p>
              </div>

              <div className="border-l border-green-200/80 px-4">
                <p className="text-lg font-black text-gray-950 sm:text-xl">
                  Local
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  Delivery focused
                </p>
              </div>

              <div className="border-l border-green-200/80 pl-4">
                <p className="text-lg font-black text-gray-950 sm:text-xl">
                  Simple
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                  Easy shopping
                </p>
              </div>
            </div>
          </div>

          {/* Right / Hero image */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="relative aspect-square">
              <div
                className="absolute inset-[10%] rounded-full bg-green-300/30 blur-3xl"
                aria-hidden="true"
              />

              <div className="absolute inset-[5%] rounded-[2.5rem] border border-white/80 bg-white/50 shadow-2xl shadow-green-900/10 backdrop-blur-sm" />

              <div className="absolute inset-[8%] overflow-hidden rounded-[2.2rem] border border-white bg-gradient-to-br from-green-100 via-lime-50 to-white shadow-2xl shadow-green-900/15">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={heroProduct?.name ?? "Fresh B-Fresh product"}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 46vw"
                    className="object-cover transition duration-700 hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-100 via-white to-lime-100">
                    <div className="text-center">
                      <div className="text-8xl">🥛</div>
                      <p className="mt-4 text-sm font-bold text-green-800">
                        Fresh every day
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-4 bottom-4">
                  <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700">
                          Fresh pick
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-gray-950">
                          {heroProduct?.name ?? "Fresh essentials"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-800">
                        B-Fresh
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card 1 */}
              <div className="absolute -left-1 top-[14%] hidden rounded-2xl border border-white/90 bg-white p-3.5 shadow-xl shadow-gray-900/10 sm:block lg:-left-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                    🥬
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Fresh choices
                    </p>
                    <p className="mt-0.5 text-sm font-black text-gray-900">
                      Every day
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating card 2 */}
              <div className="absolute -right-1 bottom-[14%] hidden rounded-2xl border border-white/90 bg-white p-3.5 shadow-xl shadow-gray-900/10 sm:block lg:-right-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-100 text-xl">
                    🚚
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Delivery
                    </p>
                    <p className="mt-0.5 text-sm font-black text-gray-900">
                      Local & easy
                    </p>
                  </div>
                </div>
              </div>

              {/* Small decorative dot */}
              <div
                className="absolute right-[12%] top-[7%] h-4 w-4 rounded-full bg-green-600 shadow-lg shadow-green-600/30"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BENEFITS STRIP
      ========================================================= */}
      <section className="relative border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.number}
              className={`group flex items-start gap-4 px-5 py-6 transition duration-300 hover:bg-green-50/60 sm:px-7 sm:py-7 ${index > 0 ? "border-t border-gray-100 sm:border-l sm:border-t-0" : ""
                }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700 transition duration-300 group-hover:scale-105 group-hover:bg-green-100">
                {benefit.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-[0.14em] text-green-600">
                    {benefit.number}
                  </span>
                  <h2 className="text-sm font-extrabold text-gray-950">
                    {benefit.title}
                  </h2>
                </div>

                <p className="mt-1.5 text-sm leading-6 text-gray-500">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          CATEGORY SECTION
      ========================================================= */}
      <section
        id="categories"
        className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                <span className="h-px w-7 bg-green-600" />
                Shop by category
              </div>

              <h2 className="max-w-2xl text-3xl font-black tracking-[-0.03em] text-gray-950 sm:text-4xl lg:text-5xl">
                Find your everyday
                <span className="block text-gray-400">
                  fresh favourites.
                </span>
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden shrink-0 items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50 hover:text-green-800 sm:inline-flex"
            >
              View all products
              <span className="ml-2">
                <ArrowIcon />
              </span>
            </Link>
          </div>

          <div className="mt-9">
            {categories && categories.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                  🥗
                </div>
                <p className="mt-4 font-semibold text-gray-800">
                  Categories are coming soon.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Check back shortly for fresh choices.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-green-700 px-6 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Browse all products
              <span className="ml-2">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      <section className="relative overflow-hidden bg-gray-50/80 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-green-100/70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                <span className="h-px w-7 bg-green-600" />
                Fresh picks
              </div>

              <h2 className="text-3xl font-black tracking-[-0.03em] text-gray-950 sm:text-4xl lg:text-5xl">
                Popular right now.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                Discover a selection of products ready for your next B-Fresh
                order.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:bg-green-50 hover:text-green-800 sm:inline-flex"
            >
              Explore all
              <span className="ml-2">
                <ArrowIcon />
              </span>
            </Link>
          </div>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="transition duration-300 hover:-translate-y-1"
                >
                  <ProductCard
                    product={product}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                🛒
              </div>
              <p className="mt-4 font-semibold text-gray-800">
                Products will appear here soon.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Add products from the B-Fresh admin dashboard.
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-green-700 px-6 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Browse all products
              <span className="ml-2">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY B-FRESH
      ========================================================= */}
      <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Intro */}
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                <span className="h-px w-7 bg-green-600" />
                Why B-Fresh
              </div>

              <h2 className="max-w-xl text-3xl font-black tracking-[-0.03em] text-gray-950 sm:text-4xl lg:text-5xl">
                Fresh shopping,
                <span className="block text-green-700">
                  without the fuss.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-gray-600">
                B-Fresh is built around a simple idea: make it easier to find
                quality everyday food and essentials and have them delivered
                locally.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex min-h-11 items-center rounded-full border border-green-200 bg-green-50 px-5 text-sm font-bold text-green-800 transition hover:-translate-y-0.5 hover:bg-green-100"
              >
                Start shopping
                <span className="ml-2">
                  <ArrowIcon />
                </span>
              </Link>
            </div>

            {/* Feature cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="group rounded-[1.75rem] border border-green-100 bg-green-50 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  🥛
                </div>

                <h3 className="mt-6 text-xl font-black text-gray-950">
                  Fresh dairy
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Everyday dairy essentials selected for your home.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-lime-100 bg-lime-50 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-900/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  🥗
                </div>

                <h3 className="mt-6 text-xl font-black text-gray-950">
                  Healthy choices
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Everyday options chosen with quality in mind.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-amber-100 bg-amber-50 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  🛍️
                </div>

                <h3 className="mt-6 text-xl font-black text-gray-950">
                  Easy shopping
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Find what you need without making shopping complicated.
                </p>
              </div>

              <div className="group rounded-[1.75rem] border border-blue-100 bg-blue-50 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                  📦
                </div>

                <h3 className="mt-6 text-xl font-black text-gray-950">
                  Local service
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Convenient delivery designed for our service area.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-green-800 px-6 py-14 shadow-2xl shadow-green-950/10 sm:px-10 sm:py-20">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-500/30 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/20">
              🌱
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-green-200">
              Your everyday fresh store
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              Bring better choices home.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-green-50/80 sm:text-base">
              Browse B-Fresh and discover fresh food, dairy and everyday
              essentials for your next order.
            </p>

            <Link
              href="/products"
              className="group mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-black text-green-900 shadow-xl transition duration-300 hover:-translate-y-0.5 hover:bg-green-50 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-800"
            >
              Explore B-Fresh
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}