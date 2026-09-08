import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalOrders, error: totalOrdersError },
    { count: pendingOrders, error: pendingOrdersError },
    { data: ordersToday, error: todayOrdersError },
    { data: deliveredOrders, error: deliveredOrdersError },
    { data: lowStockProducts, error: lowStockError },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("orders")
      .select("id")
      .gte("created_at", new Date().toISOString().slice(0, 10)),

    supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "delivered"),

    supabase
      .from("products")
      .select("id, name, stock_quantity, unit")
      .eq("is_active", true)
      .lte("stock_quantity", 5)
      .order("stock_quantity", { ascending: true })
      .limit(5),
  ]);

  const errors = [
    totalOrdersError,
    pendingOrdersError,
    todayOrdersError,
    deliveredOrdersError,
    lowStockError,
  ].filter(Boolean);

  if (errors.length > 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">
            B-Fresh Admin
          </h1>

          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {errors[0]?.message}
          </div>
        </div>
      </main>
    );
  }

  const deliveredRevenue = (deliveredOrders ?? []).reduce(
    (total, order) => total + Number(order.total_amount),
    0
  );

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders ?? 0,
      href: "/admin/orders",
    },
    {
      label: "Pending Orders",
      value: pendingOrders ?? 0,
      href: "/admin/orders",
    },
    {
      label: "Today's Orders",
      value: ordersToday?.length ?? 0,
      href: "/admin/orders",
    },
    {
      label: "Delivered Revenue",
      value: `₹${deliveredRevenue.toFixed(2)}`,
      href: "/admin/orders",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              B-Fresh Admin
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your B-Fresh store and monitor orders.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Store
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <p className="text-sm font-medium text-gray-500">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-bold text-gray-900">
                {stat.value}
              </p>
            </Link>
          ))}
        </div>

        {/* Low stock */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Low Stock Products
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Active products with 5 or fewer units remaining.
              </p>
            </div>

            <Link
              href="/admin/products"
              className="text-sm font-medium text-green-700 hover:text-green-800"
            >
              Manage Products
            </Link>
          </div>

          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="mt-5 divide-y rounded-xl border">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {product.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Stock: {product.stock_quantity}{" "}
                      {product.unit}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      product.stock_quantity === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.stock_quantity === 0
                      ? "Out of stock"
                      : "Low stock"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-dashed p-8 text-center">
              <p className="text-gray-600">
                No low-stock products right now.
              </p>
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/admin/orders"
              className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="font-semibold text-gray-900">
                Orders
              </p>

              <p className="mt-1 text-sm text-gray-600">
                View and update customer orders.
              </p>
            </Link>

            <Link
              href="/admin/products"
              className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="font-semibold text-gray-900">
                Products
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Manage products, stock and images.
              </p>
            </Link>

            <Link
              href="/admin/categories"
              className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="font-semibold text-gray-900">
                Categories
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Manage product categories.
              </p>
            </Link>

            <Link
              href="/admin/delivery-zones"
              className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="font-semibold text-gray-900">
                Delivery Zones
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Manage PIN codes and delivery fees.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}