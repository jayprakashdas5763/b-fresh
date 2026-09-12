"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AdminUser = {
    id: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
    role: string | null;
    created_at: string | null;
};

export default function UsersPage() {
    const supabase = createClient();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    async function loadUsers() {
        setLoading(true);
        setMessage("");

        const { data, error } = await supabase.rpc("get_admin_users");

        if (error) {
            setMessage(error.message);
        } else {
            setUsers(data ?? []);
        }

        setLoading(false);
    }

    async function updateRole(user: AdminUser) {
        if (updatingRoleId) {
            return;
        }

        const newRole =
            user.role === "admin" ? "customer" : "admin";

        const confirmed = window.confirm(
            newRole === "admin"
                ? `Make ${user.full_name || user.email || "this user"} an administrator?`
                : `Remove administrator access from ${user.full_name || user.email || "this user"}?`
        );

        if (!confirmed) {
            return;
        }

        setUpdatingRoleId(user.id);
        setMessage("");

        try {
            const { error } = await supabase.rpc("update_user_role", {
                p_user_id: user.id,
                p_role: newRole,
            });

            if (error) {
                throw new Error(error.message);
            }

            setUsers((current) =>
                current.map((item) =>
                    item.id === user.id
                        ? { ...item, role: newRole }
                        : item
                )
            );

            setMessage(
                `${user.full_name || user.email || "User"} is now ${newRole === "admin" ? "an administrator" : "a customer"
                }.`
            );
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to update the user's role."
            );
        } finally {
            setUpdatingRoleId(null);
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    function formatDate(value: string | null) {
        if (!value) return "—";

        return new Date(value).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    const filteredUsers = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                !search ||
                user.full_name?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search) ||
                user.phone?.toLowerCase().includes(search);

            const matchesRole =
                roleFilter === "all" ||
                user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    const adminCount = users.filter(
        (user) => user.role === "admin"
    ).length;

    const customerCount = users.filter(
        (user) => user.role === "customer"
    ).length;

    return (
        <main className="min-h-screen bg-gray-50 p-4 transition-colors dark:bg-[#07140d] sm:p-6 md:p-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-lime-300">
                            B-Fresh Administration
                        </p>

                        <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            Users
                        </h1>

                        <p className="mt-2 text-gray-600 dark:text-green-200/70">
                            View B-Fresh customers and administrators.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadUsers}
                        disabled={loading}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:bg-green-950/70 dark:text-green-100 dark:hover:bg-green-900"
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                        {message}
                    </div>
                )}

                {/* Summary */}
                <section className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70">
                        <p className="text-sm font-medium text-gray-500 dark:text-green-200/60">
                            Total Users
                        </p>

                        <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
                            {users.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70">
                        <p className="text-sm font-medium text-gray-500 dark:text-green-200/60">
                            Customers
                        </p>

                        <p className="mt-2 text-3xl font-black text-green-700 dark:text-lime-300">
                            {customerCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70">
                        <p className="text-sm font-medium text-gray-500 dark:text-green-200/60">
                            Administrators
                        </p>

                        <p className="mt-2 text-3xl font-black text-blue-700 dark:text-blue-300">
                            {adminCount}
                        </p>
                    </div>
                </section>

                {/* Filters */}
                <section className="mb-6 rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70">
                    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                        <div>
                            <label
                                htmlFor="user-search"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-600 dark:text-green-200/60"
                            >
                                Search Users
                            </label>

                            <input
                                id="user-search"
                                type="search"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Name, email or phone"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/50 dark:focus:border-lime-400 dark:focus:ring-green-950"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="role-filter"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-600 dark:text-green-200/60"
                            >
                                Role
                            </label>

                            <select
                                id="role-filter"
                                value={roleFilter}
                                onChange={(event) =>
                                    setRoleFilter(event.target.value)
                                }
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
                            >
                                <option value="all">All Roles</option>
                                <option value="customer">Customers</option>
                                <option value="admin">Administrators</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* User list */}
                <section className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 sm:p-6">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                User Accounts
                            </h2>

                            <p className="mt-1 text-sm text-gray-500 dark:text-green-200/60">
                                {filteredUsers.length}{" "}
                                {filteredUsers.length === 1
                                    ? "user"
                                    : "users"}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 p-8 text-center dark:border-green-900 dark:bg-green-950/40">
                            <p className="text-sm font-medium text-gray-500 dark:text-green-200/60">
                                Loading users...
                            </p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-green-200 p-8 text-center dark:border-green-900">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-2xl dark:bg-green-900">
                                👤
                            </div>

                            <p className="mt-4 font-bold text-gray-900 dark:text-white">
                                No users found.
                            </p>

                            {users.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setRoleFilter("all");
                                    }}
                                    className="mt-3 text-sm font-bold text-green-700 hover:text-green-800 dark:text-lime-300 dark:hover:text-lime-200"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-green-900">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 dark:border-green-900 dark:bg-green-900/40 dark:text-green-200/60">
                                        <th className="px-3 py-3 font-bold">
                                            User
                                        </th>

                                        <th className="px-3 py-3 font-bold">
                                            Phone
                                        </th>

                                        <th className="px-3 py-3 font-bold">
                                            Role
                                        </th>

                                        <th className="px-3 py-3 font-bold">
                                            Joined
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-gray-100 transition hover:bg-green-50/50 last:border-b-0 dark:border-green-900/70 dark:hover:bg-green-900/30"
                                        >
                                            <td className="px-3 py-4">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {user.full_name ||
                                                        "No name"}
                                                </div>

                                                <div className="mt-1 text-gray-500 dark:text-green-200/60">
                                                    {user.email || "No email"}
                                                </div>
                                            </td>

                                            <td className="px-3 py-4 text-gray-600 dark:text-green-200/70">
                                                {user.phone || "—"}
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${user.role === "admin"
                                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                                                : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-lime-300"
                                                            }`}
                                                    >
                                                        {user.role === "admin"
                                                            ? "Admin"
                                                            : "Customer"}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateRole(user)
                                                        }
                                                        disabled={
                                                            updatingRoleId !==
                                                            null
                                                        }
                                                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${user.role === "admin"
                                                                ? "border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-300 dark:hover:bg-orange-950/50"
                                                                : "border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/50"
                                                            }`}
                                                    >
                                                        {updatingRoleId ===
                                                            user.id ? (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                Updating...
                                                            </span>
                                                        ) : user.role ===
                                                            "admin" ? (
                                                            "Make Customer"
                                                        ) : (
                                                            "Make Admin"
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-4 text-gray-600 dark:text-green-200/60">
                                                {formatDate(
                                                    user.created_at
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}