import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          B-Fresh
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link
            href="/"
            className="transition hover:text-black"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="transition hover:text-black"
          >
            Products
          </Link>

          <Link
            href="/account"
            className="transition hover:text-black"
          >
            Account
          </Link>

          <Link
            href="/auth"
            className="rounded-lg border px-4 py-2 transition hover:bg-gray-50"
          >
            Login
          </Link>

          <Link
            href="/cart"
            className="rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
          >
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}