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

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const linkClass = (href: string) =>
        `rounded-lg px-3 py-2 transition ${isActive(href)
            ? "bg-gray-100 font-semibold text-gray-900"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        }`;

    return (
        <>
            {/* Desktop navigation */}
            <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
                <Link href="/" className={linkClass("/")}>
                    Home
                </Link>

                <Link href="/products" className={linkClass("/products")}>
                    Products
                </Link>

                {isLoggedIn && (
                    <>
                        <Link href="/account" className={linkClass("/account")}>
                            Account
                        </Link>

                        <Link href="/orders" className={linkClass("/orders")}>
                            Orders
                        </Link>

                        <Link href="/wishlist" className={linkClass("/wishlist")}>
                            Wishlist
                        </Link>

                        <Link href="/notifications" className={linkClass("/notifications")}>
                            Notifications
                            {unreadNotificationCount > 0 && (
                                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                                    {unreadNotificationCount > 99
                                        ? "99+"
                                        : unreadNotificationCount}
                                </span>
                            )}
                        </Link>
                    </>
                )}

                {isAdmin && (
                    <Link
                        href="/admin"
                        className={`ml-2 rounded-lg px-3 py-2 font-semibold transition ${pathname === "/admin" || pathname.startsWith("/admin/")
                            ? "bg-green-800 text-white"
                            : "bg-green-700 text-white hover:bg-green-800"
                            }`}
                    >
                        Admin Panel
                    </Link>
                )}

                {isLoggedIn ? (
                    <form action={signOut} className="ml-1">
                        <button
                            type="submit"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                        >
                            Logout
                        </button>
                    </form>
                ) : (
                    <Link
                        href="/auth"
                        className="ml-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50"
                    >
                        Login
                    </Link>
                )}

                <Link
                    href="/cart"
                    className={`ml-1 rounded-lg px-4 py-2 font-medium transition ${isActive("/cart")
                        ? "bg-gray-900 text-white"
                        : "bg-black text-white hover:bg-gray-800"
                        }`}
                >
                    Cart
                    {cartItemCount > 0 && (
                        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-black">
                            {cartItemCount > 99 ? "99+" : cartItemCount}
                        </span>
                    )}
                </Link>

            </nav>

            {/* Mobile menu button */}
            <button
                type="button"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 md:hidden"
            >
                {menuOpen ? "Close" : "Menu"}
            </button>

            {/* Mobile navigation */}
            {menuOpen && (
                <div className="absolute left-0 right-0 top-16 z-50 border-b bg-white shadow-sm md:hidden">
                    <nav className="mx-auto max-w-7xl space-y-1 px-4 py-3">
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className={`block ${linkClass("/")}`}
                        >
                            Home
                        </Link>

                        <Link
                            href="/products"
                            onClick={() => setMenuOpen(false)}
                            className={`block ${linkClass("/products")}`}
                        >
                            Products
                        </Link>

                        {isLoggedIn && (
                            <>
                                <Link
                                    href="/account"
                                    onClick={() => setMenuOpen(false)}
                                    className={`block ${linkClass("/account")}`}
                                >
                                    Account
                                </Link>

                                <Link
                                    href="/orders"
                                    onClick={() => setMenuOpen(false)}
                                    className={`block ${linkClass("/orders")}`}
                                >
                                    Orders
                                </Link>

                                <Link
                                    href="/wishlist"
                                    onClick={() => setMenuOpen(false)}
                                    className={`block ${linkClass("/wishlist")}`}
                                >
                                    Wishlist
                                </Link>

                                <Link
                                    href="/notifications"
                                    onClick={() => setMenuOpen(false)}
                                    className={`block ${linkClass("/notifications")}`}
                                >
                                    Notifications
                                    {unreadNotificationCount > 0 && (
                                        <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                                            {unreadNotificationCount > 99
                                                ? "99+"
                                                : unreadNotificationCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}

                        {isAdmin && (
                            <Link
                                href="/admin"
                                onClick={() => setMenuOpen(false)}
                                className={`block rounded-lg px-3 py-2 font-semibold ${pathname === "/admin" || pathname.startsWith("/admin/")
                                    ? "bg-green-800 text-white"
                                    : "bg-green-700 text-white"
                                    }`}
                            >
                                Admin Panel
                            </Link>
                        )}

                        {!isLoggedIn && (
                            <Link
                                href="/auth"
                                onClick={() => setMenuOpen(false)}
                                className={`block ${linkClass("/auth")}`}
                            >
                                Login
                            </Link>
                        )}

                        <Link
                            href="/cart"
                            onClick={() => setMenuOpen(false)}
                            className={`block ${linkClass("/cart")}`}
                        >
                            Cart
                            {cartItemCount > 0 && (
                                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-gray-900 px-1.5 text-xs font-bold text-white">
                                    {cartItemCount > 99 ? "99+" : cartItemCount}
                                </span>
                            )}
                        </Link>
                        {isLoggedIn && (
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="block w-full rounded-lg px-3 py-2 text-left font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </form>
                        )}
                    </nav>
                </div>
            )}
        </>
    );
}