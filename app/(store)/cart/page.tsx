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
            <main className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="rounded-2xl bg-white p-10 shadow-sm">
                        <div className="text-5xl">🛒</div>

                        <h1 className="mt-4 text-3xl font-bold text-gray-900">
                            Your Cart is Empty
                        </h1>

                        <p className="mt-3 text-gray-600">
                            Add some fresh products to your cart to get started.
                        </p>

                        <Link
                            href="/products"
                            className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white transition hover:bg-green-800"
                        >
                            Browse Products
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
            <main className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Your Cart
                        </h1>

                        <p className="mt-4 text-red-600">
                            Unable to load your cart. Please try again.
                        </p>

                        <Link
                            href="/products"
                            className="mt-6 inline-block rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Continue Shopping
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
        <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-green-700 transition hover:text-green-800"
                    >
                        ← Continue shopping
                    </Link>

                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Your Cart
                            </h1>

                            <p className="mt-2 text-gray-600">
                                Review your items before checkout.
                            </p>
                        </div>

                        <p className="text-sm text-gray-500">
                            {validItems.length}{" "}
                            {validItems.length === 1 ? "item" : "items"}
                        </p>
                    </div>
                </div>

                {validItems.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <div className="text-5xl">🛒</div>

                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            Your Cart is Empty
                        </h2>

                        <p className="mt-2 text-gray-600">
                            You haven't added any products yet.
                        </p>

                        <Link
                            href="/products"
                            className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-medium text-white transition hover:bg-green-800"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                        {/* Cart items */}
                        <section className="space-y-4">
                            {hasStockIssue && (
                                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                                    <p className="font-semibold text-orange-900">
                                        Please review your cart
                                    </p>

                                    <p className="mt-1 text-sm text-orange-800">
                                        One or more products are out of stock
                                        or have insufficient stock. Update
                                        the quantities before continuing to
                                        checkout.
                                    </p>
                                </div>
                            )}

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
                                    (a, b) =>
                                        a.sort_order - b.sort_order
                                );

                                return (
                                    <CartItem
                                        key={item.id}
                                        itemId={item.id}
                                        name={product.name}
                                        price={product.price}
                                        unit={product.unit}
                                        quantity={item.quantity}
                                        stockQuantity={
                                            product.stock_quantity
                                        }
                                        imageUrl={
                                            images[0]?.image_url ?? null
                                        }
                                    />
                                );
                            })}
                        </section>

                        {/* Summary */}
                        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Order Summary
                            </h2>

                            <div className="mt-5 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">
                                        ₹{subtotal.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery</span>
                                    <span className="text-right text-sm">
                                        Calculated at checkout
                                    </span>
                                </div>
                            </div>

                            <div className="my-5 border-t" />

                            <div className="flex justify-between text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            <p className="mt-2 text-xs text-gray-500">
                                Final delivery charges and total will be
                                calculated at checkout.
                            </p>

                            {!canCheckout && (
                                <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    Please fix the unavailable or
                                    insufficient-stock items before checkout.
                                </div>
                            )}

                            {canCheckout ? (
                                <Link
                                    href="/checkout"
                                    className="mt-6 block rounded-lg bg-green-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-green-800"
                                >
                                    Proceed to Checkout
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="mt-6 block w-full cursor-not-allowed rounded-lg bg-gray-300 px-5 py-3 text-center font-semibold text-gray-500"
                                >
                                    Proceed to Checkout
                                </button>
                            )}

                            <Link
                                href="/products"
                                className="mt-3 block text-center text-sm font-medium text-green-700 transition hover:text-green-800"
                            >
                                Continue Shopping
                            </Link>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}