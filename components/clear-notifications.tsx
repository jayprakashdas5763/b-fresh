"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ClearNotificationsProps = {
    hasNotifications: boolean;
};

export default function ClearNotifications({
    hasNotifications,
}: ClearNotificationsProps) {
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    if (!hasNotifications) {
        return null;
    }

    async function clearNotifications() {
        if (loading) return;

        const confirmed = window.confirm(
            "Clear all your notifications?"
        );

        if (!confirmed) return;

        setLoading(true);

        const { error } = await supabase.rpc(
            "clear_my_notifications"
        );

        if (error) {
            console.error(
                "Clear notifications error:",
                error.message
            );
        } else {
            router.refresh();
        }

        setLoading(false);
    }

    return (
        <button
            type="button"
            onClick={clearNotifications}
            disabled={loading}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? "Clearing..." : "Clear all"}
        </button>
    );
}