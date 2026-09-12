"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type NotificationItemProps = {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    isRead: boolean;
    orderId: string | null;
};

export default function NotificationItem({
    id,
    title,
    message,
    createdAt,
    isRead: initialIsRead,
    orderId,
}: NotificationItemProps) {
    const supabase = createClient();

    const [isRead, setIsRead] = useState(initialIsRead);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isRead || saving) {
            return;
        }

        async function markAsRead() {
            setSaving(true);

            const { data, error } = await supabase.rpc(
                "mark_notification_read",
                {
                    p_notification_id: id,
                },
            );

            if (error) {
                console.error(
                    "Mark notification read error:",
                    error.message,
                );
            } else if (data) {
                setIsRead(true);
            }

            setSaving(false);
        }

        markAsRead();
    }, [id, isRead, saving, supabase]);

    return (
        <article
            className={`rounded-[1.5rem] border p-5 shadow-sm transition-colors ${isRead
                    ? "border-gray-200 bg-white dark:border-green-900/70 dark:bg-green-950/70"
                    : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/40"
                }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="font-black text-gray-900 dark:text-white">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-green-100/75">
                        {message}
                    </p>
                </div>

                {!isRead && (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 dark:bg-lime-950 dark:text-lime-300">
                        New
                    </span>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-3 dark:border-green-900">
                <p className="text-xs text-gray-500 dark:text-green-200/55">
                    {new Date(createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}
                </p>

                {orderId && (
                    <a
                        href={`/orders/${orderId}`}
                        className="text-xs font-bold text-green-700 transition hover:text-green-800 dark:text-lime-300 dark:hover:text-lime-200"
                    >
                        View order →
                    </a>
                )}
            </div>
        </article>
    );
}