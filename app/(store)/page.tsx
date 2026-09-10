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
        `
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
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      {/* Hero */}
      <section className="bg-green-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-green-700">
              Fresh • Healthy • Local
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Fresh products,
              <span className="block text-green-700">
                delivered to your door.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Shop fresh dairy products, healthy food, groceries, and everyday
              essentials from B-Fresh.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white transition hover:bg-green-800"
              >
                Shop Now
              </Link>

              <Link
                href="/products"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-800 transition hover:bg-gray-50"
              >
                Explore Products
              </Link>
            </div>
          </div>

          <div className="mt-12 hidden lg:block">
            <div className="flex h-72 w-72 items-center justify-center rounded-full bg-green-100">
              <span className="text-6xl">🥛</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
              Shop by category
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Fresh choices for every day
            </h2>
          </div>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            Categories will appear here soon.
          </p>
        )}
      </section>

      {/* Products */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                Featured products
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Fresh from B-Fresh
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden text-sm font-semibold text-green-700 hover:text-green-800 sm:block"
            >
              View all →
            </Link>
          </div>

          {products && products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              Products will appear here once you add them from the admin
              dashboard.
            </p>
          )}
        </div>
      </section>

      {/* Why B-Fresh */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Why B-Fresh
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Simple, fresh, and local
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border p-6">
            <div className="text-3xl">🥛</div>
            <h3 className="mt-4 text-lg font-semibold">
              Fresh Dairy
            </h3>
            <p className="mt-2 text-gray-600">
              Fresh dairy products for your daily needs.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-3xl">🥗</div>
            <h3 className="mt-4 text-lg font-semibold">
              Healthy Choices
            </h3>
            <p className="mt-2 text-gray-600">
              Products selected with everyday health and quality in mind.
            </p>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="text-3xl">🚚</div>
            <h3 className="mt-4 text-lg font-semibold">
              Local Delivery
            </h3>
            <p className="mt-2 text-gray-600">
              Convenient delivery within our service area.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}