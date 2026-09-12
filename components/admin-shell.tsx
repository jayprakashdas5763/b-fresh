"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type AdminShellProps = {
    children: React.ReactNode;
    signOut: () => Promise<void>;
};

const navigation = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/inventory", label: "Inventory" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/delivery-zones", label: "Delivery Zones" },
    { href: "/admin/reviews", label: "Reviews" },
];

export default function AdminShell({
    children,
    signOut,
}: AdminShellProps) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function closeSidebar() {
        setSidebarOpen(false);
    }

    function isActive(href: string) {
        if (href === "/admin") {
            return pathname === "/admin";
        }

        return pathname.startsWith(href);
    }

    return (
        <div className="min-h-screen bg-gray-50 transition-colors dark:bg-[#07140d]">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-4 transition-colors dark:border-green-900/70 dark:bg-green-950/95 lg:hidden">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open admin menu"
                    className="rounded-lg border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:border-green-800 dark:text-green-100 dark:hover:bg-green-900 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950"
                >
                    <span className="text-xl leading-none">☰</span>
                </button>

                <div className="ml-3">
                    <p className="font-bold text-gray-900 dark:text-white">
                        B-Fresh
                    </p>

                    <p className="text-xs text-gray-500 dark:text-green-200/70">
                        Admin Panel
                    </p>
                </div>
            </header>

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close admin menu"
                    onClick={closeSidebar}
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
                />
            )}

            <div className="flex min-h-[calc(100vh-4rem)] lg:min-h-screen">
                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 dark:border-green-900/70 dark:bg-green-950 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                        }`}
                >
                    {/* Sidebar header */}
                    <div className="flex items-start justify-between p-6">
                        <div>
                            <Link
                                href="/admin"
                                onClick={closeSidebar}
                                className="text-2xl font-bold tracking-tight text-gray-900 transition hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 dark:text-white dark:hover:text-lime-300 dark:focus:ring-lime-400 dark:focus:ring-offset-green-950"
                            >
                                B-Fresh
                            </Link>

                            <p className="mt-1 text-sm text-gray-500 dark:text-green-200/70">
                                Admin Panel
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeSidebar}
                            aria-label="Close admin menu"
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 dark:text-green-200/70 dark:hover:bg-green-900 dark:hover:text-white dark:focus:ring-lime-400 lg:hidden"
                        >
                            <span className="text-xl leading-none">
                                ×
                            </span>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-4 pb-6">
                        <div className="space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeSidebar}
                                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${isActive(item.href)
                                            ? "bg-green-700 text-white shadow-sm dark:bg-green-700 dark:text-white"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-green-100/90 dark:hover:bg-green-900/70 dark:hover:text-white"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Secondary navigation */}
                        <div className="mt-6 border-t border-gray-200 pt-6 dark:border-green-900">
                            <Link
                                href="/"
                                onClick={closeSidebar}
                                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 dark:text-green-200/80 dark:hover:bg-green-900/70 dark:hover:text-white dark:focus:ring-lime-400"
                            >
                                ← View Store
                            </Link>

                            <Link
                                href="/account"
                                onClick={closeSidebar}
                                className="mt-1 block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 dark:text-green-200/80 dark:hover:bg-green-900/70 dark:hover:text-white dark:focus:ring-lime-400"
                            >
                                My Account
                            </Link>

                            <form action={signOut} className="mt-1">
                                <button
                                    type="submit"
                                    className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-300 dark:hover:bg-red-950/50 dark:hover:text-red-200 dark:focus:ring-red-400"
                                >
                                    Logout
                                </button>
                            </form>
                        </div>
                    </nav>
                </aside>

                {/* Main content */}
                <div className="min-w-0 flex-1 bg-gray-50 transition-colors dark:bg-[#07140d]">
                    {children}
                </div>
            </div>
        </div>
    );
}