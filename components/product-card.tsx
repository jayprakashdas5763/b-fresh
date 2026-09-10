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

type AddToCartButtonProps = {
  productId: string;
  stockQuantity: number;
  compact?: boolean;
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
          100,
      )
    : 0;

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 sm:rounded-3xl hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/10">
      {/* Product image */}
      <Link
        href={`/products/${encodeURIComponent(product.slug)}`}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[0.95] overflow-hidden bg-gradient-to-br from-green-50 via-white to-lime-50 sm:aspect-square">
          {primaryImage ? (
            <Image
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || product.name}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 639px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl shadow-inner sm:h-24 sm:w-24 sm:text-5xl">
                🥛
              </div>
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"
            aria-hidden="true"
          />

          {/* Discount */}
          {hasDiscount && (
            <div className="absolute left-2.5 top-2.5 rounded-full bg-green-700 px-2 py-1 text-[9px] font-black text-white shadow-md sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-xs">
              {discountPercentage}% OFF
            </div>
          )}

          {/* Stock */}
          <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4">
            {isOutOfStock ? (
              <span className="inline-flex items-center rounded-full border border-white/70 bg-white/90 px-2 py-1 text-[9px] font-bold text-red-700 shadow-sm backdrop-blur sm:px-3 sm:py-1.5 sm:text-xs">
                Out of stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/90 px-2 py-1 text-[9px] font-bold text-green-700 shadow-sm backdrop-blur sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                In stock
              </span>
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="p-3 sm:p-5 sm:pb-3">
          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-bold leading-5 text-gray-900 transition group-hover:text-green-700 sm:min-h-[3.5rem] sm:text-base sm:leading-7">
            {product.name}
          </h3>

          {/* Keep description on desktop, hide on small screens */}
          {product.description ? (
            <p className="mt-1.5 hidden line-clamp-2 min-h-[3rem] text-sm leading-6 text-gray-500 sm:mt-2 sm:block">
              {product.description}
            </p>
          ) : (
            <div className="hidden min-h-[3rem] sm:block" />
          )}

          <div className="mt-2.5 flex items-end justify-between gap-2 sm:mt-4 sm:gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-2">
                <span className="text-base font-black tracking-tight text-gray-950 sm:text-xl">
                  ₹{Number(product.price).toFixed(0)}
                </span>

                {hasDiscount && (
                  <span className="text-[10px] text-gray-400 line-through sm:text-sm">
                    ₹{Number(product.compare_at_price).toFixed(0)}
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-[10px] font-medium text-gray-500 sm:mt-1 sm:text-xs">
                per {product.unit}
              </p>
            </div>

            <span className="hidden shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 sm:inline-flex sm:text-xs">
              Fresh
            </span>
          </div>
        </div>
      </Link>

      {/* Wishlist */}
      <div className="absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3">
        <WishlistButton productId={product.id} />
      </div>

      {/* Cart */}
      <div className="mt-auto px-3 pb-3 pt-1.5 sm:px-5 sm:pb-5 sm:pt-2">
        <AddToCartButton
          productId={product.id}
          stockQuantity={product.stock_quantity}
          compact
        />
      </div>
    </article>
  );
}