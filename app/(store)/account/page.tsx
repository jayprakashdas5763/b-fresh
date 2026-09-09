import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddressManager from "@/components/address-manager";
import ProfileForm from "@/components/profile-form";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Account
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your profile, addresses, and orders.
          </p>
        </div>

        {/* Profile */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the information associated with your account.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {user.email}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Your email address is managed by your login account.
            </p>
          </div>

          <ProfileForm
            userId={user.id}
            initialFullName={profile?.full_name ?? ""}
            initialPhone={profile?.phone ?? ""}
          />
        </section>

        {/* Quick actions */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/orders"
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-semibold text-gray-900">
              My Orders
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              View your previous orders and track their status.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-green-700">
              View Orders →
            </span>
          </Link>

          <Link
            href="/wishlist"
            className="rounded-xl border border-gray-200 p-4 transition hover:border-green-300 hover:bg-green-50"
          >
            <h3 className="font-semibold text-gray-900">
              Wishlist
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              View your saved products
            </p>
          </Link>

          <Link
            href="#addresses"
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="font-semibold text-gray-900">
              Delivery Addresses
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Manage your saved delivery addresses.
            </p>

            <span className="mt-4 inline-block text-sm font-medium text-green-700">
              Manage Addresses →
            </span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-2xl bg-green-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="font-semibold text-green-900">
                Admin Panel
              </h2>

              <p className="mt-1 text-sm text-green-800">
                Manage products, orders, categories, and delivery zones.
              </p>

              <span className="mt-4 inline-block text-sm font-medium text-green-800">
                Open Admin Panel →
              </span>
            </Link>
          )}
        </section>

        {/* Addresses */}
        <section id="addresses" className="mt-6">
          <AddressManager />
        </section>
      </div>
    </main>
  );
}