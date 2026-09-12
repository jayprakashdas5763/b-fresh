export default function Loading() {
    return (
        <main className="min-h-screen bg-[#f4faef] px-4 py-8 dark:bg-[#07140d] sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto max-w-5xl animate-pulse">
                {/* Breadcrumb */}
                <div className="mb-5 h-4 w-40 rounded bg-gray-200 dark:bg-[#294436]" />

                {/* Order hero */}
                <section className="rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="h-7 w-32 rounded-full bg-gray-200 dark:bg-[#294436]" />

                            <div className="mt-5 h-10 w-56 rounded-xl bg-gray-200 dark:bg-[#294436]" />

                            <div className="mt-3 h-4 w-64 rounded bg-gray-200 dark:bg-[#294436]" />

                            <div className="mt-2 h-3 w-48 rounded bg-gray-200 dark:bg-[#294436]" />
                        </div>

                        <div>
                            <div className="ml-auto h-9 w-28 rounded-full bg-gray-200 dark:bg-[#294436]" />
                            <div className="mt-4 ml-auto h-8 w-32 rounded bg-gray-200 dark:bg-[#294436]" />
                        </div>
                    </div>

                    <div className="mt-7 border-t border-gray-100 pt-6 dark:border-green-900">
                        <div className="h-11 w-36 rounded-xl bg-gray-200 dark:bg-[#294436]" />
                    </div>
                </section>

                {/* Order status */}
                <section className="mt-6 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 sm:p-7">
                    <div className="h-6 w-32 rounded bg-gray-200 dark:bg-[#294436]" />
                    <div className="mt-3 h-4 w-64 rounded bg-gray-200 dark:bg-[#294436]" />

                    <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="text-center">
                                <div className="mx-auto h-10 w-10 rounded-full bg-gray-200 dark:bg-[#294436]" />
                                <div className="mx-auto mt-3 h-3 w-16 rounded bg-gray-200 dark:bg-[#294436]" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Delivery + payment */}
                <section className="mt-6 grid gap-5 md:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 sm:p-6"
                        >
                            <div className="h-6 w-36 rounded bg-gray-200 dark:bg-[#294436]" />
                            <div className="mt-5 h-28 rounded-2xl bg-gray-200 dark:bg-[#294436]" />
                        </div>
                    ))}
                </section>

                {/* Items */}
                <section className="mt-6 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 sm:p-7">
                    <div className="h-6 w-32 rounded bg-gray-200 dark:bg-[#294436]" />

                    <div className="mt-5 space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-4 rounded-xl bg-gray-100 p-4 dark:bg-green-900/40"
                            >
                                <div className="flex-1">
                                    <div className="h-4 w-40 rounded bg-gray-200 dark:bg-[#294436]" />
                                    <div className="mt-2 h-3 w-24 rounded bg-gray-200 dark:bg-[#294436]" />
                                </div>

                                <div className="h-5 w-20 rounded bg-gray-200 dark:bg-[#294436]" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Summary */}
                <section className="mt-6 rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 sm:p-7">
                    <div className="ml-auto max-w-sm">
                        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-[#294436]" />

                        <div className="mt-5 space-y-4">
                            <div className="flex justify-between">
                                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-[#294436]" />
                                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-[#294436]" />
                            </div>

                            <div className="flex justify-between">
                                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-[#294436]" />
                                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-[#294436]" />
                            </div>

                            <div className="border-t border-gray-100 pt-4 dark:border-green-900">
                                <div className="flex justify-between">
                                    <div className="h-6 w-16 rounded bg-gray-200 dark:bg-[#294436]" />
                                    <div className="h-7 w-28 rounded bg-gray-200 dark:bg-[#294436]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}