import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

type CategoryCardProps = {
  category: Category;
};

export default function CategoryCard({
  category,
}: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.slug)}`}
      className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative flex h-44 items-center justify-center bg-green-50">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl">🥗</span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          {category.name}
        </h3>

        {category.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {category.description}
          </p>
        )}

        <p className="mt-4 text-sm font-semibold text-green-700">
          Explore category →
        </p>
      </div>
    </Link>
  );
}