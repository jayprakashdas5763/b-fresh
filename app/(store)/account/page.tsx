import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddressManager from "@/components/address-manager";
import ProfileForm from "@/components/profile-form";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Manage your B-Fresh profile, delivery addresses, and orders.",
  robots: {
    index: false,
    follow: false,
  },
};

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.8-4 3.1-6 7-6s6.2 2 7 6" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 3h12a2 2 0 0 1 2 2v14H4V5a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20.8 8.9c0 5.5-8.8 10.6-8.8 10.6S3.2 14.4 3.2 8.9A4.9 4.9 0 0 1 12 6.3a4.9 4.9 0 0 1 8.8 2.6Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20 10.2c0 5.2-8 10.8-8 10.8S4 15.4 4 10.2a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

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

  const displayName =
    profile?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "B-Fresh Customer";

  return (
    <main className="min-h-screen bg-[#f5faef] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-800 via-green-700 to-green-600 px-6 py-8 shadow-xl shadow-green-900/10 sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-lime-300/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
                <UserIcon />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-green-200">
                  My B-Fresh
                </p>

                <h1 className="mt-1 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
                  Hello, {displayName}
                </h1>

                <p className="mt-1 text-sm text-green-50/80">
                  Manage your account, addresses and orders.
                </p>
              </div>
            </div>

            <Link
              href="/products"
              className="inline-flex min-h-11 w-fit items-center rounded-full bg-white px-5 text-sm font-bold text-green-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-green-50"
            >
              Start shopping →
            </Link>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/orders"
            className="group rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700 transition group-hover:bg-green-100">
              <OrdersIcon />
            </div>

            <h2 className="mt-5 font-black text-gray-950">
              My Orders
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-gray-500">
              Track orders and view your purchase history.
            </p>

            <span className="mt-4 block text-sm font-bold text-green-700">
              View orders →
            </span>
          </Link>

          <Link
            href="/wishlist"
            className="group rounded-3xl border border-lime-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-900/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-50 text-green-700 transition group-hover:bg-lime-100">
              <HeartIcon />
            </div>

            <h2 className="mt-5 font-black text-gray-950">
              Wishlist
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-gray-500">
              Keep your favourite products close.
            </p>

            <span className="mt-4 block text-sm font-bold text-green-700">
              View wishlist →
            </span>
          </Link>

          <Link
            href="#addresses"
            className="group rounded-3xl border border-amber-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-900/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 transition group-hover:bg-amber-100">
              <LocationIcon />
            </div>

            <h2 className="mt-5 font-black text-gray-950">
              Addresses
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-gray-500">
              Manage your saved delivery addresses.
            </p>

            <span className="mt-4 block text-sm font-bold text-green-700">
              Manage addresses →
            </span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="group rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-green-100 hover:shadow-xl hover:shadow-green-900/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-green-800 shadow-sm">
                <ShieldIcon />
              </div>

              <h2 className="mt-5 font-black text-green-950">
                Admin Panel
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-green-900/70">
                Manage the B-Fresh store and operations.
              </p>

              <span className="mt-4 block text-sm font-bold text-green-800">
                Open admin →
              </span>
            </Link>
          )}
        </section>

        {/* Profile */}
        <section className="mt-7 overflow-hidden rounded-[2rem] border border-green-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-green-50 to-lime-50 px-5 py-5 sm:px-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">
              Account details
            </p>

            <h2 className="mt-1 text-2xl font-black text-gray-950">
              Profile information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Keep your contact details up to date for smooth delivery.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Email address
              </p>

              <p className="mt-1 break-all text-sm font-bold text-gray-950">
                {user.email}
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Your email is managed by your B-Fresh login account.
              </p>
            </div>

            <div className="mt-5">
              <ProfileForm
                userId={user.id}
                initialFullName={profile?.full_name ?? ""}
                initialPhone={profile?.phone ?? ""}
              />
            </div>
          </div>
        </section>

        {/* Addresses */}
        <section id="addresses" className="mt-7 scroll-mt-24">
          <div className="mb-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700">
              Delivery
            </p>

            <h2 className="mt-1 text-2xl font-black text-gray-950 sm:text-3xl">
              Your addresses
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose and manage where your B-Fresh orders should go.
            </p>
          </div>

          <AddressManager />
        </section>
      </div>
    </main>
  );
}