import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CategoryCard from "@/components/category-card";
import ProductCard from "@/components/product-card";

export const metadata: Metadata = {
  title: "Fresh Food & Dairy Delivery in Odisha",
  description:
    "Shop fresh dairy products, healthy food, groceries, breakfast essentials, and everyday essentials from B-Fresh. Convenient local delivery across our service area in Odisha.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "B-Fresh | Fresh Food, Healthy Foods & Breakfast",
    description:
      "Shop fresh dairy, healthy foods, breakfast essentials, groceries, and everyday essentials from B-Fresh.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "B-Fresh | Fresh Food, Healthy Foods & Breakfast",
    description:
      "Fresh dairy, healthy foods, breakfast essentials, groceries, and everyday essentials from B-Fresh.",
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
        d="M10.293 3.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L14.586 11H3a1 1 0 1 1 0-2h11.586l-4.293-4.293a1 1 0 0 1 1.414 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: products }] =
    await Promise.all([
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
    ]);

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "B-Fresh",
        description:
          "Fresh food, healthy foods, dairy products, groceries, breakfast essentials, and everyday essentials delivered locally.",
      },
      {
        "@type": "WebSite",
        name: "B-Fresh",
        description:
          "Fresh food, healthy foods, dairy, breakfast essentials, and everyday groceries delivered locally.",
        potentialAction: {
          "@type": "SearchAction",
          target: "/products?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main className="overflow-hidden bg-[#fffdf7] text-gray-950 transition-colors dark:bg-[#07140d] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />

      <section className="relative overflow-hidden bg-[#071d12]">
        {/* Hero artwork */}
        <div className="absolute inset-x-0 top-0 z-0">
          <div className="relative w-full">
            <Image
              src="/images/bfresh-hero-basket.png"
              alt="Fresh B-Fresh basket with vegetables, fruits, dairy and healthy foods"
              width={2048}
              height={1024}
              priority
              sizes="100vw"
              className="block h-auto w-full"
            />

            {/* Desktop text readability */}
            <div
              className="absolute inset-0 hidden bg-gradient-to-r from-[#071d12]/95 via-[#071d12]/58 via-25% to-transparent lg:block"
              aria-hidden="true"
            />

            {/* Mobile text readability */}
            <div
              className="absolute inset-x-0 bottom-0 h-[7%] bg-gradient-to-t from-[#071d12] via-[#071d12]/12 to-transparent lg:hidden"
              aria-hidden="true"
            />

            {/* Soft transition into the hero background */}
            <div
              className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-[#071d12] to-transparent"
              aria-hidden="true"
            />

            {/* Very subtle image contrast */}
            <div
              className="absolute inset-0 bg-black/[0.07]"
              aria-hidden="true"
            />
          </div>
        </div>
        {/* Hero content */}
        <div className="relative z-10">
          <div
            className="
        max-w-2xl
        px-5
        pb-7
        pt-[0.7vw]
        sm:mx-auto
        sm:px-8
        sm:pb-14
        sm:pt-[38vw]
        lg:mx-0
        lg:pb-16
        lg:pl-[max(2rem,calc((100vw-1280px)/2))]
        lg:pr-8
        lg:pt-32
        xl:pl-[max(3rem,calc((100vw-1400px)/2))]
      "
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/45 bg-green-950/45 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-lime-300 shadow-sm backdrop-blur-md sm:px-4 sm:text-xs">
              <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.5)]" />
              Good food. Brighter days.
            </div>

            {/* Heading */}
            <h1 className="mt-8 text-4xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl xl:text-[5rem]">
              Fresh food
              <span className="block text-lime-500">
                for a healthier
              </span>
              <span className="block">
                happier you.
              </span>
            </h1>

            {/* Supporting copy */}
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7 lg:text-lg lg:leading-8">
              Fresh dairy, nutritious fruits &amp; vegetables, healthy foods,
              breakfast essentials, groceries and everyday needs — carefully
              selected and delivered closer to home.
            </p>

            {/* Actions */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/products"
                className="group inline-flex min-h-12 items-center justify-center rounded-full bg-lime-400 px-6 text-sm font-black text-green-950 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-lime-300 sm:px-7"
              >
                Shop fresh products
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  <ArrowIcon />
                </span>
              </Link>

              <Link
                href="#categories"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 bg-black/10 px-6 text-sm font-black text-white backdrop-blur-md transition hover:border-lime-300/70 hover:bg-white/10 hover:text-lime-300 sm:px-7"
              >
                Explore categories
              </Link>
            </div>

            {/* Trust pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-[10px] font-bold text-white/90 backdrop-blur-sm sm:text-xs">
                ✓ Fresh &amp; nutritious
              </span>

              <span className="rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-[10px] font-bold text-white/90 backdrop-blur-sm sm:text-xs">
                ✓ Local
              </span>

              <span className="rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-[10px] font-bold text-white/90 backdrop-blur-sm sm:text-xs">
                ✓ Easy delivery
              </span>
            </div>

            {/* Brand values */}
            <div className="mt-7 grid grid-cols-3 border-t border-white/20 pt-4">
              <div className="pr-3 sm:pr-4">
                <p className="text-base font-black text-white sm:text-lg">
                  Fresh
                </p>
                <p className="mt-1 text-[10px] leading-4 text-white/55 sm:text-xs">
                  Everyday essentials
                </p>
              </div>

              <div className="border-l border-white/20 px-3 sm:px-4">
                <p className="text-base font-black text-white sm:text-lg">
                  Local
                </p>
                <p className="mt-1 text-[10px] leading-4 text-white/55 sm:text-xs">
                  Delivery focused
                </p>
              </div>

              <div className="border-l border-white/20 pl-3 sm:pl-4">
                <p className="text-base font-black text-white sm:text-lg">
                  Simple
                </p>
                <p className="mt-1 text-[10px] leading-4 text-white/55 sm:text-xs">
                  Easy shopping
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* =========================================================
          BENEFITS STRIP
      ========================================================= */}
      <section className="border-b border-green-100 bg-[#f1f7ec] dark:border-green-900 dark:bg-[#0a1b12]">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.number}
              className={`group flex items-start gap-4 px-5 py-5 transition-colors hover:bg-green-50/70 dark:hover:bg-green-950/60 sm:px-7 sm:py-7 ${index > 0
                ? "border-t border-gray-100 dark:border-green-900 sm:border-l sm:border-t-0"
                : ""
                }`}
            >
              <div className="flex h-11 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700 transition group-hover:scale-105 group-hover:bg-green-100 dark:bg-green-950 dark:text-lime-300 dark:group-hover:bg-green-900">
                {benefit.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-[0.14em] text-green-600 dark:text-lime-400">
                    {benefit.number}
                  </span>

                  <h2 className="text-sm font-extrabold text-gray-950 dark:text-white">
                    {benefit.title}
                  </h2>
                </div>

                <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}
      <section
        id="categories"
        className="scroll-mt-24 bg-[#fffdf7] px-4 py-14 dark:bg-[#07140d] sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-lime-300">
                <span className="h-px w-7 bg-green-600 dark:bg-lime-400" />
                Shop by category
              </div>

              <h2 className="max-w-3xl text-3xl font-black tracking-[-0.035em] text-gray-950 sm:text-4xl lg:text-5xl dark:text-white">
                Find your everyday
                <span className="block text-gray-400 dark:text-gray-500">
                  fresh favourites.
                </span>
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden shrink-0 items-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:bg-green-50 hover:text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-lime-300 dark:hover:bg-green-900 sm:inline-flex"
            >
              View all products
              <span className="ml-2">
                <ArrowIcon />
              </span>
            </Link>
          </div>

          {categories && categories.length > 0 ? (
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          ) : (
            <div className="mt-9 rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-14 text-center dark:border-green-900 dark:bg-green-950/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl dark:bg-green-900">
                🥗
              </div>

              <p className="mt-4 font-semibold text-gray-800 dark:text-gray-100">
                Categories are coming soon.
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Check back shortly for fresh choices.
              </p>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-green-700 px-6 text-sm font-bold text-white transition hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500"
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
      <section className="relative overflow-hidden border-y border-green-100 bg-[#f4f8f1] px-4 py-14 dark:border-green-900/70 dark:bg-[#0a1b12] sm:px-6 sm:py-20 lg:px-8">
        <div
          className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-green-100/80 blur-3xl dark:bg-green-900/20"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-lime-300">
                <span className="h-px w-7 bg-green-600 dark:bg-lime-400" />
                Fresh picks
              </div>

              <h2 className="text-3xl font-black tracking-[-0.035em] text-gray-950 sm:text-4xl lg:text-5xl dark:text-white">
                Popular right now.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
                Discover a selection of products ready for your next B-Fresh
                order.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:bg-green-50 hover:text-green-800 dark:bg-green-950 dark:text-gray-100 dark:ring-green-800 dark:hover:bg-green-900 dark:hover:text-lime-300 sm:inline-flex"
            >
              Explore all
              <span className="ml-2">
                <ArrowIcon />
              </span>
            </Link>
          </div>

          {products && products.length > 0 ? (
            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
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
            <div className="mt-9 rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center dark:border-green-900 dark:bg-green-950/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl dark:bg-green-900">
                🛒
              </div>

              <p className="mt-4 font-semibold text-gray-800 dark:text-gray-100">
                Products will appear here soon.
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add products from the B-Fresh admin dashboard.
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-green-700 px-6 text-sm font-bold text-white transition hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500"
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
          HEALTHY + BREAKFAST
      ========================================================= */}
      <section className="bg-[#fffdf7] px-4 py-14 dark:bg-[#07140d] sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-2">
          <Link
            href="/products"
            className="group relative overflow-hidden rounded-[2rem] bg-green-900 px-7 py-9 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-950/10 sm:px-9 sm:py-10 dark:bg-green-950"
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-lime-400/15 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 max-w-lg">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-300">
                Healthy everyday
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Better choices for
                <span className="block text-lime-300">
                  everyday living.
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-green-100/75">
                Discover fresh, nourishing and simple food choices for your
                everyday routine.
              </p>

              <span className="mt-7 inline-flex items-center text-sm font-black text-lime-300">
                Explore healthy foods
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  <ArrowIcon />
                </span>
              </span>
            </div>
          </Link>

          <Link
            href="/products"
            className="group relative overflow-hidden rounded-[2rem] border border-lime-200 bg-lime-50 px-7 py-9 transition hover:-translate-y-1 hover:shadow-xl sm:px-9 sm:py-10 dark:border-lime-900 dark:bg-lime-950/40"
          >
            <div
              className="pointer-events-none absolute -bottom-20 -right-12 text-[9rem] opacity-[0.08]"
              aria-hidden="true"
            >
              🥣
            </div>

            <div className="relative z-10 max-w-lg">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-800 dark:text-lime-300">
                Start your morning
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-green-950 sm:text-4xl dark:text-white">
                Healthy breakfast,
                <span className="block text-green-700 dark:text-lime-300">
                  made simple.
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-green-900/70 dark:text-green-100/65">
                Milk, fruits, bread, cereals and everyday breakfast essentials
                for a better start.
              </p>

              <span className="mt-7 inline-flex items-center text-sm font-black text-green-800 dark:text-lime-300">
                Shop breakfast essentials
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  <ArrowIcon />
                </span>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================
          WHY B-FRESH
      ========================================================= */}
      <section className="border-t border-green-100 bg-[#f3f8ef] px-4 py-14 dark:border-green-900/70 dark:bg-[#081810] sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-lime-300">
              <span className="h-px w-7 bg-green-600 dark:bg-lime-400" />
              Why B-Fresh
            </div>

            <h2 className="max-w-xl text-3xl font-black tracking-[-0.035em] text-gray-950 sm:text-4xl lg:text-5xl dark:text-white">
              Fresh shopping,
              <span className="block text-green-700 dark:text-lime-300">
                without the fuss.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-gray-600 dark:text-gray-300">
              B-Fresh brings fresh food, healthy choices, breakfast
              essentials, dairy and everyday groceries together in one simple
              local shopping experience.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex min-h-11 items-center rounded-full bg-green-800 px-5 text-sm font-bold text-white transition hover:bg-green-900 dark:bg-lime-400 dark:text-green-950 dark:hover:bg-lime-300"
            >
              Start shopping
              <span className="ml-2">
                <ArrowIcon />
              </span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "🥛",
                title: "Fresh dairy",
                text: "Everyday dairy essentials selected for your home.",
              },
              {
                icon: "🥗",
                title: "Healthy choices",
                text: "Everyday options chosen with quality in mind.",
              },
              {
                icon: "🥣",
                title: "Better breakfast",
                text: "Simple foods to help you start your morning right.",
              },
              {
                icon: "📦",
                title: "Local service",
                text: "Convenient delivery designed for our service area.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.75rem] border border-green-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-green-900 dark:bg-green-950/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl dark:bg-green-900">
                  {item.icon}
                </div>

                <h3 className="mt-5 text-lg font-black text-gray-950 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-green-100/60">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="bg-[#fffdf7] px-4 pb-14 dark:bg-[#07140d] sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-green-900 px-6 py-14 text-center shadow-2xl shadow-green-950/15 sm:px-10 sm:py-20 dark:bg-green-950">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime-400/15 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-green-500/25 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-300">
              Fresh • Healthy • Local
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
              Bring better choices home.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-green-100/75 sm:text-base">
              Browse B-Fresh and discover fresh food, dairy, breakfast
              essentials and everyday groceries for your next order.
            </p>

            <Link
              href="/products"
              className="group mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-lime-400 px-7 text-sm font-black text-green-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-lime-300"
            >
              Explore B-Fresh
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}