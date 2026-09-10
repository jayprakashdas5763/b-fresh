import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your B-Fresh order and choose your delivery address.",
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
      `
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (addressError) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <p className="mt-4 text-red-600">
          {addressError.message}
        </p>
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
      `
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
        quote[0].minimum_order_amount
      );
    }
  }

  const total = subtotal + deliveryFee;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="text-sm font-medium text-green-700 hover:text-green-800"
        >
          ← Back to cart
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Choose your delivery address and review your order.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left side */}
          <CheckoutForm addresses={addresses ?? []} />

          {/* Right side */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">
              {validItems.map((item) => {
                const product = Array.isArray(item.products)
                  ? item.products[0]
                  : item.products;

                if (!product) {
                  return null;
                }

                return (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>

                      <p className="text-gray-500">
                        {item.quantity} × ₹
                        {Number(product.price).toFixed(2)}
                      </p>
                    </div>

                    <p className="font-medium text-gray-900">
                      ₹
                      {(
                        Number(product.price) * item.quantity
                      ).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="my-5 border-t" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal
                </span>

                <span className="font-medium text-gray-900">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Delivery
                </span>

                <span className="font-medium text-gray-900">
                  {deliveryError
                    ? "Unavailable"
                    : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
            </div>

            {deliveryError && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {deliveryError}
              </p>
            )}

            {minimumOrderAmount > 0 &&
              subtotal < minimumOrderAmount && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  Minimum order for this delivery area is ₹
                  {minimumOrderAmount.toFixed(2)}.
                </p>
              )}

            <div className="my-5 border-t" />

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">
                Total
              </span>

              <span className="text-2xl font-bold text-gray-900">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <p className="mt-3 text-center text-xs leading-5 text-gray-500">
              Final delivery charge and stock availability will
              be verified when the order is placed.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}