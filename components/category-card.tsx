import Link from "next/link";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
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
      href={`/products?category_id=${encodeURIComponent(category.id)}`}
      aria-label={`Shop ${category.name}`}
      className="group relative block cursor-pointer overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/10 dark:border-green-900 dark:bg-green-950/70 dark:hover:border-green-700 dark:hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950"
    >
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-green-50 via-lime-50 to-white dark:from-green-950 dark:via-green-900 dark:to-[#102019]">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="eager"
            className="object-cover transition duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl shadow-lg dark:bg-green-900">
              🥗
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-80" />

        <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 text-xs font-semibold text-green-800 shadow-sm backdrop-blur-md dark:border-green-700/70 dark:bg-green-950/85 dark:text-lime-300">
          Explore
        </div>

        <div className="absolute inset-x-5 bottom-5">
          <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
            {category.name}
          </h3>
        </div>
      </div>

      <div className="p-5">
        {category.description ? (
          <p className="line-clamp-2 min-h-12 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {category.description}
          </p>
        ) : (
          <p className="min-h-12 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Discover fresh products in this category.
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-semibold text-green-700 dark:text-lime-300">
            Shop this category
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-green-700 transition-all duration-300 group-hover:bg-green-700 group-hover:text-white dark:bg-green-900 dark:text-lime-300 dark:group-hover:bg-lime-300 dark:group-hover:text-green-950">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              <path
                d="M4 10h11M10.5 5.5 15 10l-4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}