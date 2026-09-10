import Link from "next/link";
import Image from "next/image";
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
  product_images?: ProductImage[];
};

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export default function ProductCard({
  product,
  priority = false,
}: ProductCardProps) {
  const isOutOfStock = product.stock_quantity <= 0;

  const primaryImage = product.product_images
    ?.slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0];

  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price > product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price) /
          product.compare_at_price!) *
          100
      )
    : 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/10">
      {/* Product image */}
      <Link
        href={`/products/${encodeURIComponent(product.slug)}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 via-white to-green-50">
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || product.name}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-5xl shadow-inner">
                🥛
              </div>
            </div>
          )}

          {/* Soft image overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute left-4 top-4 rounded-full bg-green-700 px-3 py-1.5 text-xs font-bold text-white shadow-md">
              {discountPercentage}% OFF
            </div>
          )}

          {/* Stock badge */}
          <div className="absolute bottom-4 left-4">
            {isOutOfStock ? (
              <span className="inline-flex items-center rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm backdrop-blur">
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                In stock
              </span>
            )}
          </div>
        </div>

        {/* Product information */}
        <div className="p-5 pb-3">
          <h3 className="line-clamp-2 min-h-[3.5rem] text-base font-bold leading-7 text-gray-900 transition group-hover:text-green-700">
            {product.name}
          </h3>

          {product.description ? (
            <p className="mt-2 line-clamp-2 min-h-[3rem] text-sm leading-6 text-gray-500">
              {product.description}
            </p>
          ) : (
            <div className="min-h-[3rem]" />
          )}

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold tracking-tight text-gray-950">
                  ₹{Number(product.price).toFixed(2)}
                </span>

                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{Number(product.compare_at_price).toFixed(2)}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs font-medium text-gray-500">
                per {product.unit}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500">
              Fresh
            </span>
          </div>
        </div>
      </Link>

      {/* Wishlist */}
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton productId={product.id} />
      </div>

      {/* Add to cart */}
      <div className="mt-auto px-5 pb-5 pt-2">
        <AddToCartButton
          productId={product.id}
          stockQuantity={product.stock_quantity}
        />
      </div>
    </article>
  );
}