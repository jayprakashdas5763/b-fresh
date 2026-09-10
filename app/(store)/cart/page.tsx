import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CartItem from "@/components/cart-item";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your selected B-Fresh products before checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

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
        d="M10.293 3.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L14.586 11H3a1 1 0 1 1 0-2h11.586l-4.293-4.293a1 1 0 0 1 0-1.414 1 1 0 0 1 1.414 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default async function CartPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) {
    return (
      <main className="min-h-screen bg-[#f5faef] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-green-100 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-4xl">
              🛒
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-green-700">
              B-Fresh Cart
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              Your cart is waiting.
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Add some fresh food, dairy or everyday essentials to get
              started.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-green-700 px-7 text-sm font-bold text-white shadow-lg shadow-green-800/10 transition hover:-translate-y-0.5 hover:bg-green-800"
            >
              Browse products
              <span className="ml-2">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data: items, error } = await supabase
    .from("cart_items")
    .select(
      `
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          slug,
          price,
          unit,
          stock_quantity,
          product_images (
            image_url,
            alt_text,
            sort_order
          )
        )
      `,
    )
    .eq("cart_id", cart.id)
    .order("created_at");

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5faef] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-red-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
              !
            </div>

            <h1 className="mt-5 text-2xl font-black text-gray-950">
              Unable to load your cart
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Please try again or continue shopping.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-green-700 px-6 text-sm font-bold text-white hover:bg-green-800"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const validItems = (items ?? []).filter((item) => item.products);

  const subtotal = validItems.reduce((total, item) => {
    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    if (!product) {
      return total;
    }

    return total + Number(product.price) * item.quantity;
  }, 0);

  const hasOutOfStockItem = validItems.some((item) => {
    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    return !product || product.stock_quantity <= 0;
  });

  const hasInsufficientStockItem = validItems.some((item) => {
    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    return (
      product &&
      product.stock_quantity > 0 &&
      item.quantity > product.stock_quantity
    );
  });

  const hasStockIssue =
    hasOutOfStockItem || hasInsufficientStockItem;

  const canCheckout =
    validItems.length > 0 && !hasStockIssue;

  return (
    <main className="min-h-screen bg-[#f5faef] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-green-50 hover:text-green-800"
          >
            ← Continue shopping
          </Link>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                B-Fresh Cart
              </p>

              <h1 className="mt-1 text-4xl font-black tracking-[-0.03em] text-gray-950 sm:text-5xl">
                Your fresh picks.
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                Review everything before heading to checkout.
              </p>
            </div>

            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
              {validItems.length}{" "}
              {validItems.length === 1 ? "item" : "items"}
            </div>
          </div>
        </div>

        {validItems.length === 0 ? (
          <div className="rounded-[2rem] border border-green-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-4xl">
              🛒
            </div>

            <h2 className="mt-5 text-2xl font-black text-gray-950">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You haven't added any products yet.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-green-700 px-6 text-sm font-bold text-white hover:bg-green-800"
            >
              Browse products
              <span className="ml-2">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Items */}
            <section className="min-w-0 space-y-4">
              {hasStockIssue && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                      !
                    </div>

                    <div>
                      <p className="font-black text-amber-950">
                        Please review your cart
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        One or more products are out of stock or have
                        insufficient stock. Update the quantities before
                        continuing.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                  <h2 className="text-base font-black text-gray-950">
                    Cart items
                  </h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {validItems.map((item) => {
                    const product = Array.isArray(item.products)
                      ? item.products[0]
                      : item.products;

                    if (!product) {
                      return null;
                    }

                    const images = [
                      ...(product.product_images ?? []),
                    ].sort(
                      (a, b) => a.sort_order - b.sort_order,
                    );

                    return (
                      <CartItem
                        key={item.id}
                        itemId={item.id}
                        productSlug={product.slug}
                        name={product.name}
                        price={product.price}
                        unit={product.unit}
                        quantity={item.quantity}
                        stockQuantity={product.stock_quantity}
                        imageUrl={
                          images[0]?.image_url ?? null
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Summary */}
            <aside className="h-fit rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-950">
                  Order summary
                </h2>

                <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
                  B-Fresh
                </span>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-gray-950">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-right text-sm font-medium text-gray-400">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="my-6 h-px bg-gray-100" />

              <div className="flex items-end justify-between gap-4">
                <span className="text-base font-bold text-gray-700">
                  Estimated total
                </span>

                <span className="text-3xl font-black tracking-tight text-green-800">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-400">
                Final delivery charge and stock availability will be
                confirmed during checkout.
              </p>

              {!canCheckout && (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm leading-6 text-red-700">
                  Please fix unavailable or insufficient-stock items before
                  checkout.
                </div>
              )}

              {canCheckout ? (
                <Link
                  href="/checkout"
                  className="group mt-6 flex min-h-13 items-center justify-center rounded-2xl bg-green-700 px-5 text-sm font-black text-white shadow-lg shadow-green-800/10 transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl"
                >
                  Proceed to checkout
                  <span className="ml-2 transition-transform group-hover:translate-x-0.5">
                    <ArrowIcon />
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-6 flex min-h-13 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-gray-100 px-5 text-sm font-bold text-gray-400"
                >
                  Proceed to checkout
                </button>
              )}

              <Link
                href="/products"
                className="mt-3 flex min-h-11 items-center justify-center rounded-2xl text-sm font-bold text-green-700 transition hover:bg-green-50 hover:text-green-800"
              >
                Continue shopping
              </Link>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5 text-center">
                <div>
                  <p className="text-sm">🥬</p>
                  <p className="mt-1 text-[9px] font-bold text-gray-500">
                    Fresh
                  </p>
                </div>

                <div>
                  <p className="text-sm">🚚</p>
                  <p className="mt-1 text-[9px] font-bold text-gray-500">
                    Local
                  </p>
                </div>

                <div>
                  <p className="text-sm">✓</p>
                  <p className="mt-1 text-[9px] font-bold text-gray-500">
                    Simple
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}