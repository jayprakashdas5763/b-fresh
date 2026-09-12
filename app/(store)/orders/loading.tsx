export default function Loading() {
    return (
        <main className="min-h-screen bg-[#f4faef] px-4 py-8 dark:bg-[#07140d] sm:px-6 sm:py-10 lg:px-8">
            <div className="mx-auto max-w-5xl animate-pulse">
                {/* Header */}
                <div className="mb-8">
                    <div className="h-10 w-44 rounded-xl bg-gray-200 dark:bg-[#294436]" />
                    <div className="mt-3 h-4 w-72 rounded bg-gray-200 dark:bg-[#294436]" />
                </div>

                {/* Order cards */}
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-[2rem] border border-green-100 bg-white p-5 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 sm:p-6"
                        >
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="h-5 w-32 rounded bg-gray-200 dark:bg-[#294436]" />
                                    <div className="mt-3 h-4 w-48 rounded bg-gray-200 dark:bg-[#294436]" />
                                    <div className="mt-4 h-6 w-24 rounded-full bg-gray-200 dark:bg-[#294436]" />
                                </div>

                                <div className="sm:text-right">
                                    <div className="ml-auto h-7 w-28 rounded bg-gray-200 dark:bg-[#294436]" />
                                    <div className="mt-3 ml-auto h-4 w-20 rounded bg-gray-200 dark:bg-[#294436]" />
                                </div>
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-5 dark:border-green-900">
                                <div className="h-11 w-full rounded-xl bg-gray-200 dark:bg-[#294436]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}