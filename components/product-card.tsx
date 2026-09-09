import Link from "next/link";
import AddToCartButton from "@/components/add-to-cart-button";
import WishlistButton from "@/components/wishlist-button";

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
    product_images?: ProductImage[];
};

type ProductCardProps = {
    product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
    const isOutOfStock = product.stock_quantity <= 0;

    const sortedImages = [...(product.product_images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order
    );

    const primaryImage = sortedImages[0];

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <Link href={`/products/${encodeURIComponent(product.slug)}`}>
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {primaryImage ? (
                        <img
                            src={primaryImage.image_url}
                            alt={primaryImage.alt_text || product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <span className="text-5xl">🥛</span>
                        </div>
                    )}

                </div>

                <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {product.description}
                        </p>
                    )}

                    <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                            <p className="text-lg font-bold text-gray-900">
                                ₹{Number(product.price).toFixed(2)}
                            </p>

                            <p className="text-sm text-gray-500">
                                per {product.unit}
                            </p>
                        </div>

                        {product.compare_at_price &&
                            product.compare_at_price > product.price && (
                                <p className="text-sm text-gray-400 line-through">
                                    ₹{Number(product.compare_at_price).toFixed(2)}
                                </p>
                            )}
                    </div>

                    <div className="mt-4">
                        {isOutOfStock ? (
                            <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                Out of stock
                            </span>
                        ) : (
                            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                In stock
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            <div className="absolute right-3 top-3">
                <WishlistButton productId={product.id} />
            </div>

            <div className="px-5 pb-5">
                <AddToCartButton
                    productId={product.id}
                    stockQuantity={product.stock_quantity}
                />
            </div>
        </article>
    );
}