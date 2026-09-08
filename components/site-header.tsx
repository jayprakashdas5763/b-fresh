import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/");
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          B-Fresh
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm font-medium text-gray-700">
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

          {user && (
            <>
              <Link
                href="/account"
                className="transition hover:text-black"
              >
                Account
              </Link>

              <Link
                href="/orders"
                className="transition hover:text-black"
              >
                Orders
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800"
            >
              Admin Panel
            </Link>
          )}

          {user ? (
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/auth"
              className="rounded-lg border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
            >
              Login
            </Link>
          )}

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