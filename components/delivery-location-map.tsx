"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
    Circle,
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";

type Coordinates = {
    latitude: number;
    longitude: number;
};

type Props = {
    coordinates: Coordinates | null;
    accuracy: number | null;
    onMapClick: (latitude: number, longitude: number) => void;
    onMarkerDragEnd: (latitude: number, longitude: number) => void;
};

function MapViewportSync({
    coordinates,
}: {
    coordinates: Coordinates | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (!coordinates) {
            return;
        }

        map.flyTo(
            [coordinates.latitude, coordinates.longitude],
            Math.max(map.getZoom(), 17),
            {
                duration: 0.7,
            },
        );
    }, [coordinates, map]);

    return null;
}

function MapClickHandler({
    onMapClick,
}: {
    onMapClick: (latitude: number, longitude: number) => void;
}) {
    useMapEvents({
        click(event) {
            onMapClick(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}

function createLocationIcon() {
    return L.divIcon({
        className: "bfresh-map-marker",
        html: `
      <div
        style="
          width:36px;
          height:36px;
          border-radius:9999px 9999px 9999px 0;
          transform:rotate(-45deg);
          background:#15803d;
          border:3px solid white;
          box-shadow:0 4px 14px rgba(0,0,0,.25);
          position:relative;
        "
      >
        <div
          style="
            width:12px;
            height:12px;
            border-radius:9999px;
            background:#bef264;
            position:absolute;
            left:9px;
            top:9px;
            border:2px solid white;
          "
        ></div>
      </div>
    `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
    });
}

export default function DeliveryLocationMap({
    coordinates,
    accuracy,
    onMapClick,
    onMarkerDragEnd,
}: Props) {
    const markerIcon = useMemo(() => createLocationIcon(), []);

    const defaultCenter: [number, number] = coordinates
        ? [coordinates.latitude, coordinates.longitude]
        : [20.2961, 85.8245];

    return (
        <div className="relative">
            <MapContainer
                center={defaultCenter}
                zoom={coordinates ? 17 : 7}
                scrollWheelZoom
                className="h-[360px] w-full sm:h-[440px]"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onMapClick={onMapClick} />

                <MapViewportSync coordinates={coordinates} />

                {coordinates && (
                    <>
                        <Circle
                            center={[coordinates.latitude, coordinates.longitude]}
                            radius={
                                accuracy !== null && Number.isFinite(accuracy)
                                    ? Math.min(Math.max(accuracy, 15), 150)
                                    : 25
                            }
                            pathOptions={{
                                color: "#15803d",
                                fillColor: "#86efac",
                                fillOpacity: 0.15,
                                weight: 1,
                            }}
                        />

                        <Marker
                            position={[coordinates.latitude, coordinates.longitude]}
                            icon={markerIcon}
                            draggable
                            eventHandlers={{
                                dragend: (event) => {
                                    const marker = event.target as L.Marker;
                                    const position = marker.getLatLng();

                                    onMarkerDragEnd(position.lat, position.lng);
                                },
                            }}
                        />
                    </>
                )}
            </MapContainer>

            <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] rounded-2xl bg-white/95 px-4 py-3 shadow-lg ring-1 ring-black/5 backdrop-blur dark:bg-green-950/95 dark:ring-white/10">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {coordinates
                        ? "Drag the pin or tap the map to adjust"
                        : "Tap the map to select a delivery point"}
                </p>

                {accuracy !== null && Number.isFinite(accuracy) && (
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-green-200/60">
                        ±{Math.round(accuracy)} m accuracy
                    </p>
                )}
            </div>
        </div>
    );
}