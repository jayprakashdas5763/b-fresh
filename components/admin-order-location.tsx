import AdminOrderLocationMap from "@/components/admin-order-location-map";

type AdminOrderLocationProps = {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    source: string | null;
    confirmedAt: string | null;
};

export default function AdminOrderLocation({
    latitude,
    longitude,
    accuracy,
    source,
    confirmedAt,
}: AdminOrderLocationProps) {
    if (latitude === null || longitude === null) {
        return (
            <section className="rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-green-300/70">
                    Delivery Location
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    Location not recorded
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    This order does not contain a saved map location.
                </p>
            </section>
        );
    }

    const mapsUrl =
        `https://www.google.com/maps/search/?api=1&query=` +
        encodeURIComponent(`${latitude},${longitude}`);

    const directionsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=` +
        encodeURIComponent(`${latitude},${longitude}`);

    const sourceLabel =
        source === "gps"
            ? "GPS"
            : source === "map"
                ? "Map selection"
                : source || "Unknown";

    return (
        <section className="rounded-2xl border border-transparent bg-white p-6 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-green-700 dark:text-lime-300">
                        Delivery Location
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                        Customer-confirmed location
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Exact coordinates saved with this order.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-green-100 dark:border-green-800 dark:bg-green-950/60 dark:text-lime-300 dark:hover:bg-green-900/70"
                    >
                        Open in Google Maps
                    </a>

                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-500"
                    >
                        Get Directions
                    </a>
                </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 dark:border-green-900/70">
                <AdminOrderLocationMap
                    latitude={latitude}
                    longitude={longitude}
                    accuracy={accuracy}
                />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-green-900/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-green-300/70">
                        Latitude
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                        {latitude.toFixed(6)}
                    </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-green-900/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-green-300/70">
                        Longitude
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                        {longitude.toFixed(6)}
                    </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-green-900/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-green-300/70">
                        Accuracy
                    </p>

                    <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                        {accuracy !== null
                            ? `±${Math.round(accuracy)} m`
                            : "Not available"}
                    </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-green-900/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-green-300/70">
                        Source
                    </p>

                    <p className="mt-1 text-sm font-bold capitalize text-gray-900 dark:text-white">
                        {sourceLabel}
                    </p>
                </div>
            </div>

            {confirmedAt && (
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Location confirmed on{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {new Date(confirmedAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </span>
                </p>
            )}
        </section>
    );
}