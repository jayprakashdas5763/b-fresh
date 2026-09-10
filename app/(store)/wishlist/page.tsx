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

export default async function WishlistPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth?next=/wishlist");
    }

    // Get the user's wishlist rows.
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
            <main className="min-h-screen bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Wishlist
                    </h1>

                    <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
                        Unable to load your wishlist.
                    </p>
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
            .in("id", productIds)
            .eq("is_active", true);

        if (productError) {
            console.error("Wishlist products error:", productError.message);

            return (
                <main className="min-h-screen bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Wishlist
                        </h1>

                        <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
                            Unable to load wishlist products.
                        </p>
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
        <main className="min-h-screen bg-white">
            <section className="border-b bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                    >
                        ← Continue shopping
                    </Link>

                    <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                        My Wishlist
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Products you want to keep for later.
                    </p>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <WishlistGrid initialItems={items} />
            </div>
        </main>
    );
}