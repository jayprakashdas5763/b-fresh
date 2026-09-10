import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WishlistGrid from "@/components/wishlist-grid";

type WishlistRow = {
  id: string;
  product_id: string;
  created_at: string;
};

type ProductImage = {
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  unit: string;
  stock_quantity: number;
  is_active: boolean;
  product_images: ProductImage[];
};

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View and manage your saved B-Fresh products.",
  robots: {
    index: false,
    follow: false,
  },
};

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20.8 8.9c0 5.5-8.8 10.6-8.8 10.6S3.2 14.4 3.2 8.9A4.9 4.9 0 0 1 12 6.3a4.9 4.9 0 0 1 8.8 2.6Z" />
    </svg>
  );
}

export default async function WishlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?next=/wishlist");
  }

  const {
    data: wishlistRows,
    error: wishlistError,
  } = await supabase
    .from("wishlists")
    .select("id, product_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (wishlistError) {
    console.error("Wishlist rows error:", wishlistError.message);

    return (
      <main className="min-h-screen bg-[#f4faef] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-100 bg-[#fffdf7] p-7 shadow-sm sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 font-black text-red-600">
              !
            </div>

            <h1 className="mt-5 text-2xl font-black text-gray-900">
              Unable to load your wishlist
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Something went wrong while loading your saved products.
            </p>

            <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              Please try again in a moment.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const rows = (wishlistRows ?? []) as WishlistRow[];

  let products: Product[] = [];

  if (rows.length > 0) {
    const productIds = rows.map((row) => row.product_id);

    const {
      data: productData,
      error: productError,
    } = await supabase
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
        is_active,
        product_images (
          image_url,
          alt_text,
          sort_order
        )
      `
      )
      .in("id", productIds)
      .eq("is_active", true);

    if (productError) {
      console.error("Wishlist products error:", productError.message);

      return (
        <main className="min-h-screen bg-[#f4faef] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl border border-red-100 bg-[#fffdf7] p-7 shadow-sm sm:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 font-black text-red-600">
                !
              </div>

              <h1 className="mt-5 text-2xl font-black text-gray-900">
                Unable to load wishlist products
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Some saved products could not be loaded right now.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </main>
      );
    }

    products = (productData ?? []).map((product) => ({
      ...product,
      product_images: product.product_images ?? [],
    })) as Product[];
  }

  // Keep the same order as the wishlist rows.
  const items = rows
    .map((row) => {
      const product = products.find(
        (item) => item.id === row.product_id
      );

      if (!product) {
        return null;
      }

      return {
        id: row.id,
        product,
      };
    })
    .filter(
      (
        item
      ): item is {
        id: string;
        product: Product;
      } => item !== null
    );

  return (
    <main className="min-h-screen bg-[#f4faef] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-green-100 bg-[#fffdf7] shadow-sm">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-lime-200/40 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 h-44 w-44 rounded-full bg-green-200/30 blur-3xl" />

          <div className="relative px-5 py-7 sm:px-8 sm:py-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-bold text-green-800">
                  <HeartIcon />
                  Saved Products
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                  My Wishlist
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
                  Keep your favourite B-Fresh products close and come back
                  to them whenever you're ready.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-md"
              >
                Continue Shopping →
              </Link>
            </div>

            {items.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-green-100 pt-5">
                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800">
                  {items.length}{" "}
                  {items.length === 1 ? "saved product" : "saved products"}
                </span>

                <span className="text-xs text-gray-500">
                  Your saved items are ready whenever you are.
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Wishlist content */}
        <section className="mt-6 sm:mt-8">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-green-200 bg-[#fffdf7] px-6 py-14 text-center shadow-sm sm:px-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-100 text-green-700">
                <HeartIcon />
              </div>

              <h2 className="mt-6 text-2xl font-black text-gray-950">
                Your wishlist is waiting
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Save products you love and they'll appear here for quick
                access later.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-2xl bg-green-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-md"
              >
                Explore Fresh Products
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-950 sm:text-2xl">
                    Your saved picks
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Products you've chosen to keep for later.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-green-100 bg-[#fffdf7] p-3 shadow-sm sm:p-5">
                <WishlistGrid initialItems={items} />
              </div>
            </div>
          )}
        </section>

        {/* Bottom reassurance */}
        {items.length > 0 && (
          <div className="mt-6 rounded-2xl border border-green-100 bg-[#fffdf7] px-4 py-3 text-center text-xs text-gray-500 sm:mt-8">
            Fresh products • Easy checkout • Delivered to your doorstep
          </div>
        )}
      </div>
    </main>
  );
}