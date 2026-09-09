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
        "get_my_notifications"
    );

    if (error) {
        console.error("Notifications error:", error.message);
    }

    const notifications = (data ?? []) as Notification[];

    return (
        <main className="min-h-screen bg-white">
            <section className="border-b bg-gray-50">
                <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="text-sm font-medium text-green-700 hover:text-green-800"
                    >
                        ← Back to home
                    </Link>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Notifications
                                </h1>

                                <p className="mt-2 text-gray-600">
                                    Updates about your B-Fresh orders.
                                </p>
                            </div>

                            <ClearNotifications
                                hasNotifications={notifications.length > 0}
                            />
                        </div>

                        <MarkAllNotificationsRead
                            hasUnread={notifications.some(
                                (notification) => !notification.is_read
                            )}
                        />
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-12 text-center">
                        <div className="text-5xl">🔔</div>

                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                            No notifications
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Order updates will appear here.
                        </p>
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