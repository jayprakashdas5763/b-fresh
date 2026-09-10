"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type SiteHeaderNavProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  cartItemCount: number;
  unreadNotificationCount: number;
  signOut: () => Promise<void>;
};

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[18px] w-[18px]"
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
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M6 3h12a2 2 0 0 1 2 2v14H4V5a2 2 0 0 1 2-2Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
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
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M20.8 8.9c0 5.5-8.8 10.6-8.8 10.6S3.2 14.4 3.2 8.9A4.9 4.9 0 0 1 12 6.3a4.9 4.9 0 0 1 8.8 2.6Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-[19px] w-[19px]"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.3 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4L21 8H6" />
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
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 4.5 2.9 8.4 7 10 4.1-1.6 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export default function SiteHeaderNav({
  isLoggedIn,
  isAdmin,
  cartItemCount,
  unreadNotificationCount,
  signOut,
}: SiteHeaderNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/auth") {
      return pathname.startsWith("/auth");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMenu = () => setMenuOpen(false);

  const desktopLinkClass = (href: string) =>
    `group inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
      isActive(href)
        ? "bg-green-100 text-green-800"
        : "text-gray-600 hover:bg-green-50 hover:text-gray-950"
    }`;

  const mobileLinkClass = (href: string) =>
    `flex min-h-12 items-center justify-between rounded-2xl border px-4 text-sm font-bold transition ${
      isActive(href)
        ? "border-green-200 bg-green-100 text-green-800"
        : "border-transparent text-gray-700 hover:border-green-100 hover:bg-green-50"
    }`;

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <HomeIcon />,
    },
    {
      href: "/products",
      label: "Products",
      icon: <GridIcon />,
    },
  ];

  return (
    <>
      {/* Desktop */}
      <nav
        aria-label="Main navigation"
        className="hidden items-center gap-1 lg:flex"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={desktopLinkClass(item.href)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        {isLoggedIn && (
          <>
            <Link
              href="/account"
              className={desktopLinkClass("/account")}
            >
              <UserIcon />
              <span>Account</span>
            </Link>

            <Link
              href="/orders"
              className={desktopLinkClass("/orders")}
            >
              <OrdersIcon />
              <span>Orders</span>
            </Link>

            <Link
              href="/wishlist"
              className={desktopLinkClass("/wishlist")}
            >
              <HeartIcon />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/notifications"
              className={desktopLinkClass("/notifications")}
            >
              <span className="relative">
                <BellIcon />

                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black leading-[17px] text-white shadow-sm">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </span>

              <span>Alerts</span>
            </Link>
          </>
        )}

        {isAdmin && (
          <Link
            href="/admin"
            className={`ml-1 inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
              pathname === "/admin" || pathname.startsWith("/admin/")
                ? "bg-green-800 text-white shadow-md"
                : "bg-green-700 text-white shadow-md hover:-translate-y-0.5 hover:bg-green-800"
            }`}
          >
            <ShieldIcon />
            <span>Admin</span>
          </Link>
        )}

        <div className="mx-1 h-7 w-px bg-green-100" />

        {isLoggedIn ? (
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-full px-3 text-sm font-semibold text-gray-600 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
            >
              Logout
            </button>
          </form>
        ) : (
          <Link
            href="/auth"
            className="inline-flex h-10 items-center rounded-full border border-green-200 bg-[#fffdf7] px-4 text-sm font-bold text-gray-800 shadow-sm transition hover:bg-green-50 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          >
            Sign in
          </Link>
        )}

        {/* Desktop cart */}
        <Link
          href="/cart"
          aria-label={`Shopping cart${
            cartItemCount > 0 ? `, ${cartItemCount} items` : ""
          }`}
          className={`group relative ml-1 inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3.5 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${
            isActive("/cart")
              ? "bg-green-800 text-white shadow-lg"
              : "bg-gray-950 text-white shadow-lg hover:-translate-y-0.5 hover:bg-gray-800"
          }`}
        >
          <CartIcon />

          <span className="hidden xl:inline">Cart</span>

          {cartItemCount > 0 && (
            <span
              className={`flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                isActive("/cart")
                  ? "bg-white text-green-800"
                  : "bg-lime-300 text-green-950"
              }`}
            >
              {cartItemCount > 99 ? "99+" : cartItemCount}
            </span>
          )}
        </Link>
      </nav>

      {/* Tablet / Mobile */}
      <div className="flex items-center gap-2 lg:hidden">
        <Link
          href="/cart"
          aria-label={`Shopping cart${
            cartItemCount > 0 ? `, ${cartItemCount} items` : ""
          }`}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${
            isActive("/cart")
              ? "bg-green-800 text-white"
              : "bg-gray-950 text-white"
          }`}
        >
          <CartIcon />

          {cartItemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-lime-300 px-1 text-[9px] font-black leading-[18px] text-green-950">
              {cartItemCount > 99 ? "99+" : cartItemCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 ${
            menuOpen
              ? "border-green-200 bg-green-100 text-green-800"
              : "border-green-100 bg-[#fffdf7] text-gray-800 shadow-sm"
          }`}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-green-100 bg-[#f7fbf2] shadow-2xl shadow-green-900/10 lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700">
                  B-Fresh
                </p>

                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  Fresh • Local • Simple
                </p>
              </div>

              {isLoggedIn && unreadNotificationCount > 0 && (
                <span className="rounded-full bg-red-50 px-2.5 py-1.5 text-[10px] font-black text-red-600">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}{" "}
                  new
                </span>
              )}
            </div>

            <nav
              aria-label="Mobile navigation"
              className="space-y-2"
            >
              <Link
                href="/"
                onClick={closeMenu}
                className={mobileLinkClass("/")}
              >
                <span className="flex items-center gap-3">
                  <HomeIcon />
                  Home
                </span>
              </Link>

              <Link
                href="/products"
                onClick={closeMenu}
                className={mobileLinkClass("/products")}
              >
                <span className="flex items-center gap-3">
                  <GridIcon />
                  Products
                </span>

                <span className="text-xs font-semibold text-gray-400">
                  Browse
                </span>
              </Link>

              {isLoggedIn && (
                <>
                  <Link
                    href="/account"
                    onClick={closeMenu}
                    className={mobileLinkClass("/account")}
                  >
                    <span className="flex items-center gap-3">
                      <UserIcon />
                      Account
                    </span>
                  </Link>

                  <Link
                    href="/orders"
                    onClick={closeMenu}
                    className={mobileLinkClass("/orders")}
                  >
                    <span className="flex items-center gap-3">
                      <OrdersIcon />
                      Orders
                    </span>
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={closeMenu}
                    className={mobileLinkClass("/wishlist")}
                  >
                    <span className="flex items-center gap-3">
                      <HeartIcon />
                      Wishlist
                    </span>
                  </Link>

                  <Link
                    href="/notifications"
                    onClick={closeMenu}
                    className={mobileLinkClass("/notifications")}
                  >
                    <span className="flex items-center gap-3">
                      <span className="relative">
                        <BellIcon />

                        {unreadNotificationCount > 0 && (
                          <span className="absolute -right-2 -top-2 flex min-w-[17px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black leading-[17px] text-white">
                            {unreadNotificationCount > 99
                              ? "99+"
                              : unreadNotificationCount}
                          </span>
                        )}
                      </span>

                      Notifications
                    </span>

                    {unreadNotificationCount > 0 && (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                        {unreadNotificationCount > 99
                          ? "99+"
                          : unreadNotificationCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <Link
                href="/cart"
                onClick={closeMenu}
                className={mobileLinkClass("/cart")}
              >
                <span className="flex items-center gap-3">
                  <CartIcon />
                  Cart
                </span>

                {cartItemCount > 0 && (
                  <span className="rounded-full bg-gray-950 px-2.5 py-1 text-[10px] font-black text-white">
                    {cartItemCount > 99 ? "99+" : cartItemCount} items
                  </span>
                )}
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold text-white transition ${
                    pathname === "/admin" || pathname.startsWith("/admin/")
                      ? "bg-green-800"
                      : "bg-green-700 hover:bg-green-800"
                  }`}
                >
                  <ShieldIcon />
                  Admin Panel
                </Link>
              )}

              <div className="my-3 h-px bg-green-100" />

              {isLoggedIn ? (
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex min-h-12 w-full items-center rounded-2xl border border-red-100 bg-white px-4 text-left text-sm font-bold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Logout
                  </button>
                </form>
              ) : (
                <Link
                  href="/auth"
                  onClick={closeMenu}
                  className="flex min-h-12 items-center justify-center rounded-2xl bg-green-700 px-4 text-sm font-bold text-white shadow-lg shadow-green-800/10 transition hover:bg-green-800"
                >
                  Sign in / Create account
                </Link>
              )}
            </nav>

            <div className="mt-4 rounded-2xl border border-green-100 bg-[#fffdf7] px-4 py-3">
              <p className="text-xs font-semibold leading-5 text-green-900">
                Fresh food. Everyday essentials. Delivered locally.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}