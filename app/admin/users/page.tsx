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
                : `Remove administrator access from ${user.full_name || user.email || "this user"
                }?`
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
                `${user.full_name || user.email || "User"} is now ${newRole === "admin"
                    ? "an administrator"
                    : "a customer"
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
        <main className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Users
                        </h1>

                        <p className="mt-2 text-gray-600">
                            View B-Fresh customers and administrators.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadUsers}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        {message}
                    </div>
                )}

                {/* Summary */}
                <section className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Users
                        </p>

                        <p className="mt-2 text-3xl font-bold text-gray-900">
                            {users.length}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Customers
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-700">
                            {customerCount}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Administrators
                        </p>

                        <p className="mt-2 text-3xl font-bold text-blue-700">
                            {adminCount}
                        </p>
                    </div>
                </section>

                {/* Filters */}
                <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="grid gap-3 md:grid-cols-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search by name, email or phone"
                            className="rounded-lg border border-gray-300 p-3 text-gray-900"
                        />

                        <select
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(event.target.value)
                            }
                            className="rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                        >
                            <option value="all">
                                All Roles
                            </option>

                            <option value="customer">
                                Customers
                            </option>

                            <option value="admin">
                                Administrators
                            </option>
                        </select>
                    </div>
                </section>

                {/* User list */}
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                User Accounts
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {filteredUsers.length}{" "}
                                {filteredUsers.length === 1
                                    ? "user"
                                    : "users"}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-gray-500">
                            Loading users...
                        </p>
                    ) : filteredUsers.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center">
                            <p className="font-medium text-gray-900">
                                No users found.
                            </p>

                            {users.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setRoleFilter("all");
                                    }}
                                    className="mt-3 text-sm font-medium text-green-700 hover:text-green-800"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-gray-500">
                                        <th className="px-3 py-3 font-medium">
                                            User
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Phone
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Role
                                        </th>

                                        <th className="px-3 py-3 font-medium">
                                            Joined
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b last:border-b-0"
                                        >
                                            <td className="px-3 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {user.full_name ||
                                                        "No name"}
                                                </div>

                                                <div className="mt-1 text-gray-500">
                                                    {user.email ||
                                                        "No email"}
                                                </div>
                                            </td>

                                            <td className="px-3 py-4 text-gray-600">
                                                {user.phone || "—"}
                                            </td>

                                            <td className="px-3 py-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.role === "admin"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-green-100 text-green-700"
                                                            }`}
                                                    >
                                                        {user.role === "admin"
                                                            ? "Admin"
                                                            : "Customer"}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => updateRole(user)}
                                                        disabled={updatingRoleId !== null}
                                                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${user.role === "admin"
                                                                ? "border-orange-300 text-orange-700 hover:bg-orange-50"
                                                                : "border-blue-300 text-blue-700 hover:bg-blue-50"
                                                            }`}
                                                    >
                                                        {updatingRoleId === user.id ? (
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                Updating...
                                                            </span>
                                                        ) : user.role === "admin" ? (
                                                            "Make Customer"
                                                        ) : (
                                                            "Make Admin"
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-3 py-4 text-gray-600">
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