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
                }
            );

            if (error) {
                console.error(
                    "Mark notification read error:",
                    error.message
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
            className={`rounded-2xl border p-5 ${
                isRead
                    ? "border-gray-200 bg-white"
                    : "border-green-200 bg-green-50"
            }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="font-semibold text-gray-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                        {message}
                    </p>
                </div>

                {!isRead && (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        New
                    </span>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
                <p className="text-xs text-gray-500">
                    {new Date(createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}
                </p>

                {orderId && (
                    <a
                        href={`/orders/${orderId}`}
                        className="text-xs font-medium text-green-700 hover:text-green-800"
                    >
                        View order →
                    </a>
                )}
            </div>
        </article>
    );
}