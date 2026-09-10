import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/product-card";

type ProductsPageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const categorySlug = params.category?.trim() || "";
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
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  if (categoriesError) {
    console.error("Categories error:", categoriesError.message);
  }

  const selectedCategory = categories?.find(
    (category) => category.slug === categorySlug
  );

  /*
   * Count matching products first.
   * This lets us safely handle URLs such as /products?page=999.
   */
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
      `name.ilike.%${escapedSearch}%,sku.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`
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
    Math.ceil((totalProducts ?? 0) / pageSize)
  );

  const safePage =
    currentPage > totalPages ? totalPages : currentPage;

  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  /*
   * Fetch only the products for the current page.
   */
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
      selectedCategory.id
    );
  }

  if (searchQuery) {
    const escapedSearch = searchQuery.replace(/[%_]/g, "\\$&");

    productQuery = productQuery.or(
      `name.ilike.%${escapedSearch}%,sku.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`
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
    !categorySlug &&
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

    if (categorySlug) {
      query.set("category", categorySlug);
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
    <main className="min-h-screen bg-white">
      {productListStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productListStructuredData),
          }}
        />
      )}

      {/* Header */}
      <section className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            B-Fresh Store
          </p>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Fresh products
              </h1>

              <p className="mt-2 text-gray-600">
                Find fresh dairy, healthy food, groceries, and daily essentials.
              </p>
            </div>

            <Link
              href="/"
              className="text-sm font-medium text-green-700 hover:text-green-800"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search */}
        <form
          action="/products"
          method="GET"
          className="mb-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search products..."
            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />

          {categorySlug && (
            <input
              type="hidden"
              name="category"
              value={categorySlug}
            />
          )}

          <button
            type="submit"
            className="rounded-xl bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
          >
            Search
          </button>
        </form>

        {/* Categories */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Categories
            </h2>

            {(categorySlug || searchQuery) && (
              <Link
                href="/products"
                className="text-sm font-medium text-green-700 hover:text-green-800"
              >
                Clear filters
              </Link>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link
              href={
                searchQuery
                  ? `/products?q=${encodeURIComponent(searchQuery)}`
                  : "/products"
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                !categorySlug
                  ? "bg-green-700 text-white"
                  : "border bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All Products
            </Link>

            {categories?.map((category) => {
              const query = new URLSearchParams();

              query.set("category", category.slug);

              if (searchQuery) {
                query.set("q", searchQuery);
              }

              return (
                <Link
                  key={category.id}
                  href={`/products?${query.toString()}`}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    category.slug === categorySlug
                      ? "bg-green-700 text-white"
                      : "border bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Result heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory
              ? selectedCategory.name
              : searchQuery
                ? `Search results for "${searchQuery}"`
                : "All Products"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {totalProducts ?? 0}{" "}
            {(totalProducts ?? 0) === 1
              ? "product"
              : "products"}
          </p>
        </div>

        {/* Products */}
        {products && products.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-3"
                aria-label="Product pagination"
              >
                {safePage > 1 ? (
                  <Link
                    href={buildPageUrl(previousPage)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
                    ← Previous
                  </span>
                )}

                <span className="text-sm text-gray-600">
                  Page {safePage} of {totalPages}
                </span>

                {safePage < totalPages ? (
                  <Link
                    href={buildPageUrl(nextPage)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
                    Next →
                  </span>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <div className="text-5xl">🔎</div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No products found
            </h3>

            <p className="mt-2 text-gray-600">
              Try another search or browse all products.
            </p>

            <Link
              href="/products"
              className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
            >
              View all products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}