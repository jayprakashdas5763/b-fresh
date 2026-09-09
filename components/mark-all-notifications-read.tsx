"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MarkAllNotificationsReadProps = {
    hasUnread: boolean;
};

export default function MarkAllNotificationsRead({
    hasUnread,
}: MarkAllNotificationsReadProps) {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);

    if (!hasUnread) {
        return null;
    }

    async function markAllAsRead() {
        if (loading) return;

        setLoading(true);

        const { error } = await supabase.rpc(
            "mark_all_notifications_read"
        );

        if (error) {
            console.error(
                "Mark all notifications read error:",
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
            onClick={markAllAsRead}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? "Marking..." : "Mark all as read"}
        </button>
    );
}