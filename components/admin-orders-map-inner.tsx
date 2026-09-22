"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
    CircleMarker,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import type { AdminMapOrder } from "@/components/admin-orders-map";

type Props = {
    orders: AdminMapOrder[];
};

const markerIcon = L.divIcon({
    className: "",
    html: `
        <div
            style="
                width:34px;
                height:34px;
                border-radius:9999px;
                background:#15803d;
                border:4px solid white;
                box-shadow:0 4px 14px rgba(0,0,0,0.28);
                display:flex;
                align-items:center;
                justify-content:center;
                color:white;
                font-weight:800;
                font-size:13px;
            "
        >
            ●
        </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
});

function FitMapToOrders({
    orders,
}: {
    orders: AdminMapOrder[];
}) {
    const map = useMap();

    useEffect(() => {
        if (orders.length === 0) {
            return;
        }

        const bounds = L.latLngBounds(
            orders.map((order) => [
                order.shipping_latitude,
                order.shipping_longitude,
            ])
        );

        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 15,
        });
    }, [map, orders]);

    return null;
}

function formatStatus(status: string) {
    return status
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
}

export default function AdminOrdersMap({
    orders,
}: Props) {
    const center: [number, number] =
        orders.length > 0
            ? [
                orders[0].shipping_latitude,
                orders[0].shipping_longitude,
            ]
            : [20.2961, 85.8245];

    return (
        <section className="overflow-hidden rounded-2xl border border-transparent bg-white shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-green-900">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700 dark:text-lime-300">
                            Delivery Overview
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                            Active order locations
                        </h2>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {orders.length} active order
                            {orders.length === 1 ? "" : "s"} with
                            saved delivery coordinates.
                        </p>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 dark:bg-green-900/60 dark:text-lime-300">
                        {orders.length} on map
                    </span>
                </div>
            </div>

            <div className="h-[420px] w-full">
                <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />

                    <FitMapToOrders orders={orders} />

                    {orders.map((order) => {
                        const mapsUrl =
                            `https://www.google.com/maps/dir/?api=1&destination=` +
                            encodeURIComponent(
                                `${order.shipping_latitude},${order.shipping_longitude}`
                            );

                        return (
                            <div key={order.id}>
                                <Marker
                                    position={[
                                        order.shipping_latitude,
                                        order.shipping_longitude,
                                    ]}
                                    icon={markerIcon}
                                >
                                    <Popup>
                                        <div className="min-w-[190px]">
                                            <p className="text-sm font-bold">
                                                Order #
                                                {order.order_number}
                                            </p>

                                            <p className="mt-1 text-sm">
                                                {order.shipping_full_name}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {formatStatus(
                                                    order.status
                                                )}
                                            </p>

                                            <a
                                                href={`/admin/orders/${order.id}`}
                                                className="mt-3 block rounded-lg bg-green-700 px-3 py-2 text-center text-xs font-bold text-white"
                                            >
                                                View Order
                                            </a>

                                            <a
                                                href={mapsUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 block rounded-lg border border-green-700 px-3 py-2 text-center text-xs font-bold text-green-700"
                                            >
                                                Get Directions
                                            </a>
                                        </div>
                                    </Popup>
                                </Marker>

                                <CircleMarker
                                    center={[
                                        order.shipping_latitude,
                                        order.shipping_longitude,
                                    ]}
                                    radius={5}
                                    pathOptions={{
                                        color: "#15803d",
                                        fillColor: "#22c55e",
                                        fillOpacity: 0.25,
                                        weight: 1,
                                    }}
                                />
                            </div>
                        );
                    })}
                </MapContainer>
            </div>
        </section>
    );
}