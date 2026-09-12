export default function Loading() {
    return (
        <main className="min-h-screen bg-[#fffdf7] px-4 py-8 dark:bg-[#07140d] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold text-green-700 dark:text-lime-300">
                        Fresh picks are loading…
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Getting the latest products ready for you.
                    </p>
                </div>

                <div className="animate-pulse">
                    <div className="mb-8 h-10 w-64 rounded-lg bg-gray-200 dark:bg-[#294436]" />

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#294436] dark:bg-[#102019]"
                            >
                                <div className="aspect-square bg-gray-200 dark:bg-[#1a3025]" />

                                <div className="space-y-3 p-4">
                                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-[#294436]" />
                                    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-[#294436]" />
                                    <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-[#294436]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}