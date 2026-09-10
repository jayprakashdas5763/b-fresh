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

  let unreadNotificationCount = 0;

  type NotificationRow = {
    is_read: boolean;
  };

  if (user) {
    const [
      { data: notifications, error: notificationError },
      { data: profile },
      { data: cart },
    ] = await Promise.all([
      supabase.rpc("get_my_notifications"),

      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single(),

      supabase
        .from("carts")
        .select("id, cart_items(quantity)")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (notificationError) {
      console.error(
        "Notification count error:",
        notificationError.message
      );
    } else {
      unreadNotificationCount =
        (notifications as NotificationRow[] | null | undefined)?.filter(
          (notification) => !notification.is_read
        ).length ?? 0;
    }

    isAdmin = profile?.role === "admin";

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
          className="flex shrink-0 items-center"
          aria-label="B-Fresh home"
        >
          <img
            src="/icon-192.png"
            alt="B-Fresh"
            className="h-11 w-11 object-contain"
          />
          <span className="ml-2 text-xl font-extrabold tracking-tight text-gray-900">
            B-Fresh
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <SiteHeaderNav
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            cartItemCount={cartItemCount}
            unreadNotificationCount={unreadNotificationCount}
            signOut={signOut}
          />

        </div>
      </div>
    </header>
  );
}