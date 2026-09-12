import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/product-card";

type ProductsPageProps = {
  searchParams: Promise<{
    category_id?: string;
    q?: string;
    page?: string;
  }>;
};

type Category = {
  id: string;
  name: string;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const categoryId = params.category_id?.trim() || "";
  const searchQuery = params.q?.trim() || "";

  const pageSize = 12;

  const requestedPage = Number.parseInt(params.page || "1", 10);

  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const supabase = await createClient();

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (categoriesError) {
    console.error("Categories error:", categoriesError.message);
  }

  const selectedCategory = categories?.find(
    (category) => category.id === categoryId,
  );

  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (selectedCategory) {
    countQuery = countQuery.eq("category_id", selectedCategory.id);
  }

  if (searchQuery) {
    const escapedSearch = searchQuery.replace(/[%_]/g, "\\$&");

    countQuery = countQuery.or(
      `name.ilike.%${escapedSearch}%,sku.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`,
    );
  }

  const {
    count: totalProducts,
    error: countError,
  } = await countQuery;

  if (countError) {
    console.error("Products count error:", countError.message);
  }

  const totalPages = Math.max(
    1,
    Math.ceil((totalProducts ?? 0) / pageSize),
  );

  const safePage =
    currentPage > totalPages ? totalPages : currentPage;

  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let productQuery = supabase
    .from("products")
    .select(`
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
        `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (selectedCategory) {
    productQuery = productQuery.eq(
      "category_id",
      selectedCategory.id,
    );
  }

  if (searchQuery) {
    const escapedSearch = searchQuery.replace(/[%_]/g, "\\$&");

    productQuery = productQuery.or(
      `name.ilike.%${escapedSearch}%,sku.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`,
    );
  }

  const {
    data: products,
    error: productsError,
  } = await productQuery.range(from, to);

  if (productsError) {
    console.error("Products error:", productsError.message);
  }

  const productListStructuredData =
    !categoryId &&
      !searchQuery &&
      safePage === 1 &&
      products &&
      products.length > 0
      ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "B-Fresh Products",
        itemListElement: products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: product.name,
          url: `/products/${encodeURIComponent(product.slug)}`,
        })),
      }
      : null;

  const previousPage = safePage - 1;
  const nextPage = safePage + 1;

  const buildPageUrl = (page: number) => {
    const query = new URLSearchParams();

    if (categoryId) {
      query.set("category_id", categoryId);
    }

    if (searchQuery) {
      query.set("q", searchQuery);
    }

    if (page > 1) {
      query.set("page", String(page));
    }

    const queryString = query.toString();

    return queryString
      ? `/products?${queryString}`
      : "/products";
  };

  return (
    <main className="min-h-screen bg-[#f5faef] dark:bg-[#07140d]">
      {productListStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productListStructuredData),
          }}
        />
      )}

      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-green-100 bg-gradient-to-br from-green-800 via-green-700 to-green-600 dark:border-green-900 dark:from-green-950 dark:via-green-900 dark:to-green-800">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-lime-300/15 blur-3xl dark:bg-lime-300/10"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-green-300/15 blur-3xl dark:bg-green-400/10"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-100">
            <span className="h-px w-7 bg-green-200" />
            B-Fresh Store
          </div>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Fresh choices.
                <span className="block text-lime-200 dark:text-lime-300">
                  One easy store.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-green-50/85 sm:text-base">
                Explore fresh dairy, healthy food, groceries and
                everyday essentials selected for your home.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex min-h-11 w-fit items-center rounded-full border border-white/20 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* SEARCH */}
        <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm dark:border-green-900 dark:bg-green-950/60 sm:p-5">
          <form
            action="/products"
            method="GET"
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>

              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search fresh products..."
                className="min-h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-lime-500 dark:focus:bg-green-950 dark:focus:ring-green-900"
              />
            </div>

            {categoryId && (
              <input
                type="hidden"
                name="category_id"
                value={categoryId}
              />
            )}

            <button
              type="submit"
              className="min-h-12 rounded-2xl bg-green-700 px-7 text-sm font-bold text-white shadow-lg shadow-green-800/10 transition hover:-translate-y-0.5 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-500 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950"
            >
              Search
            </button>
          </form>
        </section>

        {/* CATEGORIES */}
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-lime-300">
                Browse
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950 dark:text-white">
                Shop by category
              </h2>
            </div>

            {(categoryId || searchQuery) && (
              <Link
                href="/products"
                className="rounded-full bg-white px-4 py-2 text-xs font-bold text-green-800 shadow-sm ring-1 ring-green-100 transition hover:bg-green-50 dark:bg-green-950 dark:text-lime-300 dark:ring-green-800 dark:hover:bg-green-900"
              >
                Clear filters
              </Link>
            )}
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            <Link
              href={
                searchQuery
                  ? `/products?q=${encodeURIComponent(searchQuery)}`
                  : "/products"
              }
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${!categoryId
                  ? "bg-green-700 text-white shadow-md shadow-green-800/10 dark:bg-green-600"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-green-50 hover:text-green-800 dark:bg-green-950 dark:text-gray-200 dark:ring-green-800 dark:hover:bg-green-900 dark:hover:text-lime-300"
                }`}
            >
              All Products
            </Link>

            {categories?.map((category: Category) => {
              const query = new URLSearchParams();

              query.set("category_id", category.id);

              if (searchQuery) {
                query.set("q", searchQuery);
              }

              return (
                <Link
                  key={category.id}
                  href={`/products?${query.toString()}`}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${category.id === categoryId
                      ? "bg-green-700 text-white shadow-md shadow-green-800/10 dark:bg-green-600"
                      : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-green-50 hover:text-green-800 dark:bg-green-950 dark:text-gray-200 dark:ring-green-800 dark:hover:bg-green-900 dark:hover:text-lime-300"
                    }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </section>

        {/* RESULTS */}
        <section className="mt-10">
          <div className="flex flex-col gap-3 border-b border-green-100 pb-5 dark:border-green-900 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-lime-300">
                {selectedCategory
                  ? "Category"
                  : searchQuery
                    ? "Search"
                    : "Fresh picks"}
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950 dark:text-white sm:text-3xl">
                {selectedCategory
                  ? selectedCategory.name
                  : searchQuery
                    ? `Results for "${searchQuery}"`
                    : "All products"}
              </h2>
            </div>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {totalProducts ?? 0}{" "}
              {(totalProducts ?? 0) === 1
                ? "product"
                : "products"}
            </p>
          </div>

          {products && products.length > 0 ? (
            <>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
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

              {totalPages > 1 && (
                <nav
                  className="mt-12 flex items-center justify-center gap-3"
                  aria-label="Product pagination"
                >
                  {safePage > 1 ? (
                    <Link
                      href={buildPageUrl(previousPage)}
                      className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-green-50 hover:text-green-800 dark:bg-green-950 dark:text-gray-200 dark:ring-green-800 dark:hover:bg-green-900 dark:hover:text-lime-300"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-400 dark:bg-green-950/50 dark:text-gray-600">
                      ← Previous
                    </span>
                  )}

                  <span className="rounded-full bg-green-50 px-4 py-2.5 text-sm font-bold text-green-800 dark:bg-green-900 dark:text-lime-300">
                    {safePage} / {totalPages}
                  </span>

                  {safePage < totalPages ? (
                    <Link
                      href={buildPageUrl(nextPage)}
                      className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-green-50 hover:text-green-800 dark:bg-green-950 dark:text-gray-200 dark:ring-green-800 dark:hover:bg-green-900 dark:hover:text-lime-300"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-400 dark:bg-green-950/50 dark:text-gray-600">
                      Next →
                    </span>
                  )}
                </nav>
              )}
            </>
          ) : (
            <div className="mt-7 rounded-3xl border border-dashed border-green-200 bg-white px-6 py-16 text-center shadow-sm dark:border-green-900 dark:bg-green-950/50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl dark:bg-green-900">
                🔎
              </div>

              <h3 className="mt-5 text-xl font-black text-gray-950 dark:text-white">
                Nothing matched your search
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                Try another search term or browse the complete
                B-Fresh collection.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex min-h-11 items-center rounded-full bg-green-700 px-6 text-sm font-bold text-white transition hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500"
              >
                View all products
                <span className="ml-2">→</span>
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}