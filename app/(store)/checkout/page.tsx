import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your B-Fresh order and choose your delivery address.",
  robots: {
    index: false,
    follow: false,
  },
};

type CheckoutPageProps = {
  searchParams: Promise<{
    address?: string;
  }>;
};

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { address: addressParam } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: addresses, error: addressError } = await supabase
    .from("addresses")
    .select(
      `
            id,
            label,
            full_name,
            phone,
            address_line1,
            address_line2,
            landmark,
            city,
            state,
            postal_code,
            is_default
            `,
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (addressError) {
    return (
      <main className="min-h-screen bg-[#f5faef] px-4 py-12 transition-colors dark:bg-[#07140d] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-red-100 bg-white p-10 text-center shadow-sm dark:border-red-900/70 dark:bg-green-950/70">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl text-red-600 dark:bg-red-950/50 dark:text-red-300">
              !
            </div>

            <h1 className="mt-5 text-2xl font-black text-gray-950 dark:text-white">
              Checkout unavailable
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-green-200/70">
              We couldn't load your delivery information.
            </p>

            <Link
              href="/cart"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-green-700 px-6 text-sm font-bold text-white transition hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600"
            >
              Return to cart
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedAddress =
    addresses?.find((address) => address.id === addressParam) ??
    addresses?.find((address) => address.is_default) ??
    addresses?.[0];

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) {
    redirect("/cart");
  }

  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select(
      `
            id,
            quantity,
            products (
                id,
                name,
                price,
                unit,
                stock_quantity
            )
            `,
    )
    .eq("cart_id", cart.id)
    .order("created_at");

  if (itemsError) {
    console.error(itemsError.message);
  }

  const validItems = (items ?? []).filter((item) => {
    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    return Boolean(product);
  });

  if (validItems.length === 0) {
    redirect("/cart");
  }

  const subtotal = validItems.reduce((total, item) => {
    const product = Array.isArray(item.products)
      ? item.products[0]
      : item.products;

    if (!product) {
      return total;
    }

    return total + Number(product.price) * item.quantity;
  }, 0);

  let deliveryFee = 0;
  let minimumOrderAmount = 0;
  let deliveryError = "";

  if (selectedAddress) {
    const { data: quote, error: quoteError } =
      await supabase.rpc("get_delivery_quote", {
        p_address_id: selectedAddress.id,
      });

    if (quoteError) {
      deliveryError = quoteError.message;
    } else if (quote?.length) {
      deliveryFee = Number(quote[0].delivery_fee);
      minimumOrderAmount = Number(
        quote[0].minimum_order_amount,
      );
    }
  }

  const total = subtotal + deliveryFee;

  return (
    <main className="min-h-screen bg-[#f5faef] px-4 py-8 transition-colors dark:bg-[#07140d] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* CHECKOUT HEADER */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-green-50 hover:text-green-800 dark:bg-green-950/70 dark:text-green-100 dark:ring-green-900 dark:hover:bg-green-900 dark:hover:text-lime-300"
          >
            ← Back to cart
          </Link>

          <div className="mt-7">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-lime-300">
              B-Fresh Checkout
            </p>

            <h1 className="mt-1 text-4xl font-black tracking-[-0.03em] text-gray-950 dark:text-white sm:text-5xl">
              Almost there.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-green-200/70 sm:text-base">
              Choose where you'd like your order delivered and
              review everything before placing it.
            </p>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mb-7 rounded-2xl border border-green-100 bg-white p-4 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70">
          <div className="flex items-center">
            <div className="flex items-center gap-2 text-sm font-bold text-green-800 dark:text-lime-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-xs text-white dark:bg-green-600">
                1
              </span>
              Delivery
            </div>

            <div className="mx-3 h-px flex-1 bg-green-100 dark:bg-green-900" />

            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 dark:text-green-200/40">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 dark:bg-green-900/60 dark:text-green-200/60">
                2
              </span>
              Review & place
            </div>
          </div>
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* CHECKOUT FORM */}
          <section className="min-w-0">
            <div className="overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70">
              <div className="border-b border-gray-100 px-5 py-5 dark:border-green-900 sm:px-7">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700 dark:text-lime-300">
                  Delivery details
                </p>

                <h2 className="mt-1 text-xl font-black text-gray-950 dark:text-white">
                  Where should we deliver?
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-green-200/70">
                  Select an existing address or add one from
                  your account.
                </p>
              </div>

              <div className="bg-white p-5 dark:bg-green-950/70 sm:p-7">
                <CheckoutForm
                  addresses={addresses ?? []}
                />
              </div>
            </div>
          </section>

          {/* SUMMARY */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700 dark:text-lime-300">
                    Your order
                  </p>

                  <h2 className="mt-1 text-xl font-black text-gray-950 dark:text-white">
                    Order summary
                  </h2>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-700 dark:bg-green-950 dark:text-lime-300">
                  {validItems.length}{" "}
                  {validItems.length === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {validItems.map((item) => {
                  const product = Array.isArray(
                    item.products,
                  )
                    ? item.products[0]
                    : item.products;

                  if (!product) {
                    return null;
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                          {product.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400 dark:text-green-200/50">
                          {item.quantity} × ₹
                          {Number(
                            product.price,
                          ).toFixed(2)}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-black text-gray-950 dark:text-white">
                        ₹
                        {(
                          Number(product.price) *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="my-6 h-px bg-gray-100 dark:bg-green-900" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 dark:text-green-200/70">
                    Subtotal
                  </span>

                  <span className="font-bold text-gray-950 dark:text-white">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-gray-500 dark:text-green-200/70">
                    Delivery
                  </span>

                  <span className="font-bold text-gray-950 dark:text-white">
                    {deliveryError
                      ? "Unavailable"
                      : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {deliveryError && (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {deliveryError}
                </div>
              )}

              {minimumOrderAmount > 0 &&
                subtotal < minimumOrderAmount && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm leading-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    Minimum order for this delivery area
                    is ₹
                    {minimumOrderAmount.toFixed(2)}.
                  </div>
                )}

              <div className="my-6 h-px bg-gray-100 dark:bg-green-900" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-green-100">
                    Total
                  </p>

                  <p className="mt-1 text-xs text-gray-400 dark:text-green-200/50">
                    Delivery included
                  </p>
                </div>

                <p className="text-3xl font-black tracking-tight text-green-800 dark:text-lime-300">
                  ₹{total.toFixed(2)}
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-green-50 p-4 dark:bg-green-900/40">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🚚</span>

                  <div>
                    <p className="text-sm font-black text-green-900 dark:text-green-100">
                      Local delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-green-800/70 dark:text-green-100/65">
                      Final stock and delivery details
                      will be verified when the order is
                      placed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}