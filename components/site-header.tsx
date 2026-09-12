import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
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
    <header className="sticky top-0 z-50 border-b border-green-100 bg-[#f7fbf2]/95 shadow-sm backdrop-blur-md dark:border-green-900/70 dark:bg-[#07140d]/95">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:min-h-[4.25rem] sm:gap-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          aria-label="B-Fresh home"
          className="-ml-1 flex shrink-0 items-center rounded-2xl p-1 transition hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:hover:bg-green-950 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950 sm:ml-0 sm:p-1.5"        >
          <Image
            src="/icon-192.png"
            alt="B-Fresh"
            width={42}
            height={42}
            priority
            className="h-10 w-10 rounded-xl transition duration-300 group-hover:scale-105 sm:h-11 sm:w-11"
          />

          <div className="ml-2 sm:ml-2.5">
            <span className="block text-[1.15rem] font-black tracking-[-0.03em] text-gray-950 dark:text-white sm:text-[1.25rem]">
              B-Fresh
            </span>

            <span className="hidden text-[9px] font-bold uppercase tracking-[0.15em] text-green-700 dark:text-lime-300 sm:block">
              Fresh • Local • Simple
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="min-w-0">
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