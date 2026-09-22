"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

export type DeliveryLocation = {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    source: "gps" | "map";
    formattedAddress: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
};

type Coordinates = {
    latitude: number;
    longitude: number;
};

type DeliveryLocationMapProps = {
    coordinates: Coordinates | null;
    accuracy: number | null;
    onMapClick: (latitude: number, longitude: number) => void;
    onMarkerDragEnd: (latitude: number, longitude: number) => void;
};

type Props = {
    initialLatitude?: number | null;
    initialLongitude?: number | null;
    initialAccuracy?: number | null;
    onLocationConfirmed: (location: DeliveryLocation) => void;
};

type ReverseGeocodeResult = {
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postcode?: string;
};

const DeliveryLocationMap = dynamic<DeliveryLocationMapProps>(
    () =>
        import("@/components/delivery-location-map").then(
            (module) => module.default,
        ),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-[360px] w-full items-center justify-center bg-green-50 sm:h-[440px] dark:bg-green-950/40">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-green-200 border-t-green-700 dark:border-green-800 dark:border-t-lime-300" />

                    <p className="mt-3 text-sm font-semibold text-gray-600 dark:text-green-100/70">
                        Loading map...
                    </p>
                </div>
            </div>
        ),
    },
);

function formatAccuracy(accuracy: number | null) {
    if (accuracy === null || !Number.isFinite(accuracy)) {
        return null;
    }

    if (accuracy < 20) {
        return `±${Math.round(accuracy)} m · Very accurate`;
    }

    if (accuracy < 100) {
        return `±${Math.round(accuracy)} m · Good accuracy`;
    }

    return `±${Math.round(accuracy)} m · Approximate`;
}

export default function DeliveryLocationPicker({
    initialLatitude = null,
    initialLongitude = null,
    initialAccuracy = null,
    onLocationConfirmed,
}: Props) {
    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

    const initialCoordinates = useMemo<Coordinates | null>(() => {
        if (
            typeof initialLatitude !== "number" ||
            !Number.isFinite(initialLatitude) ||
            typeof initialLongitude !== "number" ||
            !Number.isFinite(initialLongitude)
        ) {
            return null;
        }

        return {
            latitude: initialLatitude,
            longitude: initialLongitude,
        };
    }, [initialLatitude, initialLongitude]);

    const [coordinates, setCoordinates] =
        useState<Coordinates | null>(initialCoordinates);

    const [accuracy, setAccuracy] = useState<number | null>(
        initialAccuracy ?? null,
    );

    const [source, setSource] = useState<"gps" | "map">(
        initialCoordinates ? "map" : "map",
    );

    const [reverseGeocode, setReverseGeocode] =
        useState<ReverseGeocodeResult | null>(null);

    const [loadingLocation, setLoadingLocation] = useState(false);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const reverseGeocodeLocation = useCallback(
        async (
            latitude: number,
            longitude: number,
        ): Promise<ReverseGeocodeResult | null> => {
            if (!apiKey) {
                throw new Error(
                    "Geoapify is not configured. Add NEXT_PUBLIC_GEOAPIFY_API_KEY.",
                );
            }

            const params = new URLSearchParams({
                lat: String(latitude),
                lon: String(longitude),
                format: "json",
                limit: "1",
                lang: "en",
                countrycode: "in",
                apiKey,
            });

            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/reverse?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error("Unable to identify this location.");
            }

            const data = (await response.json()) as {
                results?: ReverseGeocodeResult[];
            };

            return data.results?.[0] ?? null;
        },
        [apiKey],
    );

    const updateLocation = useCallback(
        async (
            latitude: number,
            longitude: number,
            nextSource: "gps" | "map",
            nextAccuracy: number | null,
        ) => {
            setCoordinates({
                latitude,
                longitude,
            });

            setAccuracy(nextAccuracy);
            setSource(nextSource);
            setError("");
            setMessage("");
            setLoadingAddress(true);

            try {
                const result = await reverseGeocodeLocation(
                    latitude,
                    longitude,
                );

                setReverseGeocode(result);

                if (result) {
                    setMessage(
                        "Location identified. Check the map pin before confirming.",
                    );
                } else {
                    setMessage(
                        "Location selected. We could not find a detailed address automatically.",
                    );
                }
            } catch (err) {
                setReverseGeocode(null);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to identify this location.",
                );
            } finally {
                setLoadingAddress(false);
            }
        },
        [reverseGeocodeLocation],
    );

    function handleUseCurrentLocation() {
        setError("");
        setMessage("");

        if (!navigator.geolocation) {
            setError(
                "Location services are not supported by this browser.",
            );
            return;
        }

        if (!apiKey) {
            setError(
                "Location service is not configured. Please add NEXT_PUBLIC_GEOAPIFY_API_KEY.",
            );
            return;
        }

        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await updateLocation(
                        position.coords.latitude,
                        position.coords.longitude,
                        "gps",
                        Number.isFinite(position.coords.accuracy)
                            ? position.coords.accuracy
                            : null,
                    );
                } finally {
                    setLoadingLocation(false);
                }
            },
            (geoError) => {
                setLoadingLocation(false);

                switch (geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        setError(
                            "Location permission was denied. Please allow location access or choose the location on the map.",
                        );
                        break;

                    case geoError.POSITION_UNAVAILABLE:
                        setError(
                            "Your current location could not be determined. Please try again or choose the location on the map.",
                        );
                        break;

                    case geoError.TIMEOUT:
                        setError(
                            "Location detection timed out. Please try again or choose the location on the map.",
                        );
                        break;

                    default:
                        setError(
                            "Unable to detect your current location. Please choose the location on the map.",
                        );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    }

    async function handleMapLocation(
        latitude: number,
        longitude: number,
    ) {
        await updateLocation(
            latitude,
            longitude,
            "map",
            null,
        );
    }

    function handleConfirm() {
        if (!coordinates) {
            setError("Please select a delivery location first.");
            return;
        }

        onLocationConfirmed({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            accuracy,
            source,
            formattedAddress: reverseGeocode?.formatted ?? null,
            addressLine1:
                reverseGeocode?.address_line1 ?? null,
            addressLine2:
                reverseGeocode?.address_line2 ?? null,
            city: reverseGeocode?.city ?? null,
            state: reverseGeocode?.state ?? null,
            postalCode:
                reverseGeocode?.postcode ?? null,
        });

        setMessage("Delivery location confirmed.");
        setError("");
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-green-100 bg-[#fffdf7] shadow-sm dark:border-green-900/70 dark:bg-green-950/70">
            <div className="border-b border-green-100 bg-gradient-to-r from-green-50 to-lime-50 px-5 py-5 dark:border-green-900 dark:from-green-950 dark:to-green-900 sm:px-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white">
                        📍
                    </div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-green-700 dark:text-lime-300">
                            Delivery location
                        </p>

                        <h3 className="mt-1 text-xl font-black text-gray-950 dark:text-white">
                            Confirm your delivery point
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-green-100/70">
                            Use your current location or move the pin to the exact place
                            where you want your order delivered.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={loadingLocation}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loadingLocation ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Detecting your location...
                        </>
                    ) : (
                        <>
                            <span aria-hidden="true">◎</span>
                            Use my current location
                        </>
                    )}
                </button>
            </div>

            <DeliveryLocationMap
                coordinates={coordinates}
                accuracy={accuracy}
                onMapClick={handleMapLocation}
                onMarkerDragEnd={handleMapLocation}
            />

            <div className="space-y-4 p-5 sm:p-6">
                {loadingAddress && (
                    <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:bg-green-900/40 dark:text-green-100">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-200 border-t-green-700 dark:border-green-700 dark:border-t-lime-300" />
                        Identifying this location...
                    </div>
                )}

                {reverseGeocode && (
                    <div className="rounded-2xl border border-green-100 bg-green-50/70 p-4 dark:border-green-900 dark:bg-green-900/30">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-green-700 dark:text-lime-300">
                            Selected location
                        </p>

                        <p className="mt-2 text-sm font-bold leading-6 text-gray-900 dark:text-white">
                            {reverseGeocode.formatted ??
                                "Location selected on the map"}
                        </p>

                        {coordinates && (
                            <p className="mt-2 font-mono text-[10px] text-gray-500 dark:text-green-200/60">
                                {coordinates.latitude.toFixed(6)},{" "}
                                {coordinates.longitude.toFixed(6)}
                            </p>
                        )}
                    </div>
                )}

                {accuracy !== null && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 dark:border-blue-900/70 dark:bg-blue-950/30">
                        <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                            Location accuracy
                        </p>

                        <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                            {formatAccuracy(accuracy)}
                        </p>
                    </div>
                )}

                {message && (
                    <div
                        role="status"
                        className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-900 dark:bg-green-900/40 dark:text-green-100"
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                    >
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!coordinates || loadingAddress}
                    className="min-h-12 w-full rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Confirm this delivery location
                </button>
            </div>
        </div>
    );
}