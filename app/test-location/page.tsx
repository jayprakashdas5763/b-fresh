"use client";

import DeliveryLocationPicker from "@/components/delivery-location-picker";

export default function TestLocationPage() {
    return (
        <main className="min-h-screen bg-[#f4faef] px-4 py-8 dark:bg-[#07140d] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-green-700 dark:text-lime-300">
                        B-Fresh
                    </p>

                    <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                        Delivery Location Test
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-green-100/70">
                        Test current-location detection, map selection, pin movement, and
                        reverse geocoding before connecting the feature to saved addresses.
                    </p>
                </div>

                <DeliveryLocationPicker
                    onLocationConfirmed={(location) => {
                        console.log(
                            "Confirmed delivery location:",
                            location,
                        );
                    }}
                />
            </div>
        </main>
    );
}