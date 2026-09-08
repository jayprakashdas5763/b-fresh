import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeaderNav from "@/components/site-header-nav";

export default async function SiteHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let cartItemCount = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";

    const { data: cart } = await supabase
      .from("carts")
      .select("id, cart_items(quantity)")
      .eq("user_id", user.id)
      .maybeSingle();

    if (cart?.cart_items) {
      cartItemCount = cart.cart_items.reduce(
        (total, item) => total + (item.quantity ?? 0),
        0
      );
    }
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/");
  }

  return (
    <header className="relative border-b bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-2xl font-bold tracking-tight text-gray-900"
        >
          B-Fresh
        </Link>

        <div className="flex items-center gap-2">
          <SiteHeaderNav
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            cartItemCount={cartItemCount}
            signOut={signOut}
          />

        </div>
      </div>
    </header>
  );
}