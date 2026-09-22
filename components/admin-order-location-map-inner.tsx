"use client";

import L from "leaflet";
import {
    Circle,
    MapContainer,
    Marker,
    TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type AdminOrderLocationMapInnerProps = {
    latitude: number;
    longitude: number;
    accuracy: number | null;
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
                box-shadow:0 4px 14px rgba(0,0,0,0.25);
                display:flex;
                align-items:center;
                justify-content:center;
            "
        >
            <div
                style="
                    width:9px;
                    height:9px;
                    border-radius:9999px;
                    background:white;
                "
            ></div>
        </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
});

export default function AdminOrderLocationMapInner({
    latitude,
    longitude,
    accuracy,
}: AdminOrderLocationMapInnerProps) {
    const center: [number, number] = [
        latitude,
        longitude,
    ];

    const radius = Math.max(accuracy ?? 25, 8);

    return (
        <div className="h-[320px] w-full">
            <MapContainer
                center={center}
                zoom={16}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                <Circle
                    center={center}
                    radius={radius}
                    pathOptions={{
                        color: "#15803d",
                        fillColor: "#22c55e",
                        fillOpacity: 0.12,
                        weight: 2,
                    }}
                />

                <Marker
                    position={center}
                    icon={markerIcon}
                />
            </MapContainer>
        </div>
    );
}