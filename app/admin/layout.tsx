import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    redirect("/account");
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full border-b bg-white lg:w-64 lg:border-b-0 lg:border-r">
          <div className="p-6">
            <Link
              href="/admin"
              className="text-2xl font-bold tracking-tight text-gray-900"
            >
              B-Fresh
            </Link>

            <p className="mt-1 text-sm text-gray-500">
              Admin Panel
            </p>
          </div>

          <nav className="px-4 pb-6">
            <div className="space-y-1">
              <Link
                href="/admin"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Dashboard
              </Link>

              <Link
                href="/admin/orders"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Orders
              </Link>

              <Link
                href="/admin/products"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Products
              </Link>

              <Link
                href="/admin/categories"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Categories
              </Link>

              <Link
                href="/admin/delivery-zones"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Delivery Zones
              </Link>
            </div>

            <div className="mt-6 border-t pt-6">
              <Link
                href="/"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ← View Store
              </Link>

              <Link
                href="/account"
                className="mt-1 block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                My Account
              </Link>

              <form action={signOut} className="mt-1">
                <button
                  type="submit"
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                >
                  Logout
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}