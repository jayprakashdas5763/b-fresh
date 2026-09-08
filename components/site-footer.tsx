export default function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              B-Fresh
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">
              Fresh dairy, healthy food, groceries, and daily essentials
              delivered locally.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Quick Links</h3>

            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p>Home</p>
              <p>Products</p>
              <p>My Account</p>
              <p>Contact</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Customer Support</h3>

            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p>Local delivery</p>
              <p>Order support</p>
              <p>Delivery information</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} B-Fresh. All rights reserved.
        </div>
      </div>
    </footer>
  );
}