import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotificationItem from "@/components/notification-item";
import MarkAllNotificationsRead from "@/components/mark-all-notifications-read";
import ClearNotifications from "@/components/clear-notifications";

type Notification = {
    id: string;
    order_id: string | null;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

export default async function NotificationsPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth?next=/notifications");
    }

    const { data, error } = await supabase.rpc(
        "get_my_notifications",
    );

    if (error) {
        console.error("Notifications error:", error.message);
    }

    const notifications = (data ?? []) as Notification[];

    return (
        <main className="min-h-screen bg-[#f5faef] transition-colors dark:bg-[#07140d]">
            {/* Header */}
            <section className="border-b border-green-100 bg-gray-50 transition-colors dark:border-green-900/70 dark:bg-green-950/40">
                <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-green-700 shadow-sm ring-1 ring-green-100 transition hover:bg-green-50 hover:text-green-800 dark:bg-green-950/70 dark:text-lime-300 dark:ring-green-900 dark:hover:bg-green-900"
                    >
                        ← Back to home
                    </Link>

                    <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-green-700 dark:text-lime-300">
                                B-Fresh Updates
                            </p>

                            <h1 className="mt-1 text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                                Notifications
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-green-200/70">
                                Updates about your B-Fresh orders.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <ClearNotifications
                                hasNotifications={
                                    notifications.length > 0
                                }
                            />

                            <MarkAllNotificationsRead
                                hasUnread={notifications.some(
                                    (notification) =>
                                        !notification.is_read,
                                )}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {notifications.length === 0 ? (
                    <div className="rounded-[2rem] border border-dashed border-green-200 bg-white p-12 text-center shadow-sm dark:border-green-900 dark:bg-green-950/70">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-4xl dark:bg-green-900">
                            🔔
                        </div>

                        <h2 className="mt-5 text-xl font-black text-gray-950 dark:text-white">
                            No notifications
                        </h2>

                        <p className="mt-2 text-sm text-gray-600 dark:text-green-200/70">
                            Order updates will appear here.
                        </p>

                        <Link
                            href="/orders"
                            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-green-700 px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600"
                        >
                            View my orders
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                id={notification.id}
                                title={notification.title}
                                message={notification.message}
                                createdAt={notification.created_at}
                                isRead={notification.is_read}
                                orderId={notification.order_id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}