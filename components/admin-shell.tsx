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
        <div className="min-h-screen bg-gray-50">
            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-4 lg:hidden">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open admin menu"
                    className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
                >
                    <span className="text-xl leading-none">☰</span>
                </button>

                <div className="ml-3">
                    <p className="font-bold text-gray-900">
                        B-Fresh
                    </p>

                    <p className="text-xs text-gray-500">
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
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                />
            )}

            <div className="flex min-h-[calc(100vh-4rem)] lg:min-h-screen">
                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
                        sidebarOpen
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
                                className="text-2xl font-bold tracking-tight text-gray-900"
                            >
                                B-Fresh
                            </Link>

                            <p className="mt-1 text-sm text-gray-500">
                                Admin Panel
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeSidebar}
                            aria-label="Close admin menu"
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
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
                                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                                        isActive(item.href)
                                            ? "bg-green-700 text-white"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Secondary navigation */}
                        <div className="mt-6 border-t pt-6">
                            <Link
                                href="/"
                                onClick={closeSidebar}
                                className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                ← View Store
                            </Link>

                            <Link
                                href="/account"
                                onClick={closeSidebar}
                                className="mt-1 block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                                My Account
                            </Link>

                            <form action={signOut} className="mt-1">
                                <button
                                    type="submit"
                                    className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
                                >
                                    Logout
                                </button>
                            </form>
                        </div>
                    </nav>
                </aside>

                {/* Main content */}
                <div className="min-w-0 flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}