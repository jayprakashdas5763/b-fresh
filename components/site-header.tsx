import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeaderNav from "@/components/site-header-nav";
import Image from "next/image";

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
<header className="sticky top-0 z-50 border-b border-green-100 bg-[#f7fbf2]/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center rounded-2xl p-1.5 -ml-1.5 transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          aria-label="B-Fresh home"
        >
          <Image
            src="/icon-192.png"
            alt="B-Fresh"
            width={44}
            height={44}
            priority
            className="rounded-xl transition duration-300 group-hover:scale-105"
          />

          <div className="ml-2.5">
            <span className="block text-[1.25rem] font-black tracking-[-0.03em] text-gray-950">
              B-Fresh
            </span>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.15em] text-green-700 sm:block">
              Fresh • Local • Simple
            </span>
          </div>
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