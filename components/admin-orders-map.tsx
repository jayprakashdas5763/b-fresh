"use client";

import dynamic from "next/dynamic";

export type AdminMapOrder = {
    id: string;
    order_number: number;
    status: string;
    shipping_full_name: string;
    shipping_latitude: number;
    shipping_longitude: number;
};

const AdminOrdersMapInner = dynamic(
    () =>
        import("@/components/admin-orders-map-inner").then(
            (module) => module.default
        ),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[420px] items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-500 dark:bg-green-950/40 dark:text-green-300/70">
                Loading delivery map...
            </div>
        ),
    }
);

export default function AdminOrdersMap({
    orders,
}: {
    orders: AdminMapOrder[];
}) {
    return <AdminOrdersMapInner orders={orders} />;
}