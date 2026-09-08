import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CheckoutPage() {
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
    console.error(addressError.message);
  }

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
          <section className="space-y-6">
            {/* Address */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Delivery Address
                </h2>

                <Link
                  href="/account"
                  className="text-sm font-medium text-green-700 hover:text-green-800"
                >
                  Manage addresses
                </Link>
              </div>

              {addresses && addresses.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className="flex cursor-pointer gap-3 rounded-xl border p-4 transition hover:border-green-600"
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        defaultChecked={address.is_default}
                        className="mt-1"
                      />

                      <span className="text-sm">
                        <strong className="block text-gray-900">
                          {address.label}
                        </strong>

                        <span className="mt-1 block text-gray-600">
                          {address.full_name}
                          <br />
                          {address.address_line1}
                          {address.address_line2
                            ? `, ${address.address_line2}`
                            : ""}
                          <br />
                          {address.city}, {address.state} -{" "}
                          {address.postal_code}
                          <br />
                          Phone: {address.phone}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed p-6 text-center">
                  <p className="text-gray-600">
                    You don't have a saved delivery address.
                  </p>

                  <Link
                    href="/account"
                    className="mt-4 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
                  >
                    Add Address
                  </Link>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">
                Payment Method
              </h2>

              <div className="mt-4 rounded-xl border border-green-600 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked
                    readOnly
                    className="mt-1"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Pay when your B-Fresh order is delivered.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Order summary */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Order Summary
            </h2>

            <div className="mt-5 space-y-4">
              {validItems.map((item) => {
                const product = Array.isArray(item.products)
                  ? item.products[0]
                  : item.products;

                if (!product) return null;

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

            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="mt-2 flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>Calculated from PIN</span>
            </div>

            <div className="my-5 border-t" />

            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              Final delivery charge and stock availability will be
              verified when the order is placed.
            </p>

            <button
              type="button"
              disabled={!addresses || addresses.length === 0}
              className="mt-6 w-full rounded-xl bg-green-700 px-5 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Place Order — Cash on Delivery
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}