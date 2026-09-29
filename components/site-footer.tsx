
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-green-900 dark:bg-[#07140d]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight text-green-700 transition hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              B-Fresh
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-300">
              Fresh dairy, healthy food, groceries, and daily essentials
              delivered locally with care.
            </p>

            <p className="mt-4 text-sm font-medium text-green-700 dark:text-green-400">
              Fresh • Local • Reliable
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Shop
            </h3>

            <nav className="mt-4 space-y-3 text-sm" aria-label="Shop links">
              <Link
                href="/"
                className="block text-gray-600 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
              >
                Home
              </Link>

              <Link
                href="/products"
                className="block text-gray-600 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
              >
                All Products
              </Link>

              <Link
                href="/products"
                className="block text-gray-600 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
              >
                Categories
              </Link>
            </nav>
          </div>

          {/* Customer */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Customer
            </h3>

            <nav
              className="mt-4 space-y-3 text-sm"
              aria-label="Customer links"
            >
              <Link
                href="/account"
                className="block text-gray-600 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
              >
                My Account
              </Link>

              <Link
                href="/orders"
                className="block text-gray-600 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
              >
                My Orders
              </Link>

              <Link
                href="/wishlist"
                className="block text-gray-600 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
              >
                Wishlist
              </Link>

              <Link
                href="/cart"
                className="block text-gray-600 transition hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
              >
                Cart
              </Link>
            </nav>
          </div>

          {/* Help & Support */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Help & Support
            </h3>

            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <p>Local delivery</p>
              <p>Order support</p>
              <p>Delivery information</p>

              <Link
                href="/contact"
                className="block transition hover:text-green-700 dark:hover:text-green-400"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-green-900 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} B-Fresh. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="transition hover:text-green-700 dark:hover:text-green-400"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-green-700 dark:hover:text-green-400"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/refund"
              className="transition hover:text-green-700 dark:hover:text-green-400"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
