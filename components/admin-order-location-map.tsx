"use client";

import dynamic from "next/dynamic";

type AdminOrderLocationMapProps = {
    latitude: number;
    longitude: number;
    accuracy: number | null;
};

const AdminOrderLocationMapInner =
    dynamic<AdminOrderLocationMapProps>(
        () =>
            import("@/components/admin-order-location-map-inner").then(
                (module) => module.default
            ),
        {
            ssr: false,
            loading: () => (
                <div className="flex h-[320px] items-center justify-center bg-gray-100 text-sm text-gray-500 dark:bg-green-950/40 dark:text-green-300/70">
                    Loading delivery map...
                </div>
            ),
        }
    );

export default function AdminOrderLocationMap({
    latitude,
    longitude,
    accuracy,
}: AdminOrderLocationMapProps) {
    return (
        <AdminOrderLocationMapInner
            latitude={latitude}
            longitude={longitude}
            accuracy={accuracy}
        />
    );
}