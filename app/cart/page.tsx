import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CartItem from "@/components/cart-item";

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
            <main className="min-h-screen bg-gray-50 px-4 py-16">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Your Cart
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Your cart is currently empty.
                    </p>

                    <Link
                        href="/products"
                        className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
                    >
                        Browse Products
                    </Link>
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
          price,
          unit,
          stock_quantity,
          product_images (
            image_url,
            alt_text,
            sort_order
          )
        )
      `
        )
        .eq("cart_id", cart.id)
        .order("created_at");

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50 px-4 py-16">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Your Cart
                    </h1>

                    <p className="mt-4 text-red-600">
                        Unable to load your cart.
                    </p>
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

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                    >
                        ← Continue shopping
                    </Link>

                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        Your Cart
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Review your items before checkout.
                    </p>
                </div>

                {validItems.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <p className="text-gray-600">
                            Your cart is empty.
                        </p>

                        <Link
                            href="/products"
                            className="mt-5 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                        {/* Cart items */}
                        <section className="space-y-4">
                            {validItems.map((item) => {
                                const product = Array.isArray(item.products)
                                    ? item.products[0]
                                    : item.products;

                                if (!product) {
                                    return null;
                                }

                                const images = [...(product.product_images ?? [])].sort(
                                    (a, b) => a.sort_order - b.sort_order
                                );

                                return (
                                    <CartItem
                                        key={item.id}
                                        itemId={item.id}
                                        name={product.name}
                                        price={product.price}
                                        unit={product.unit}
                                        quantity={item.quantity}
                                        stockQuantity={product.stock_quantity}
                                        imageUrl={images[0]?.image_url ?? null}
                                    />
                                );
                            })}
                        </section>

                        {/* Summary */}
                        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Order Summary
                            </h2>

                            <div className="mt-5 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery</span>
                                    <span>Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="my-5 border-t" />

                            <div className="flex justify-between text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            <Link
                                href="/checkout"
                                className="mt-6 block rounded-lg bg-green-700 px-5 py-3 text-center font-semibold text-white hover:bg-green-800"
                            >
                                Proceed to Checkout
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}