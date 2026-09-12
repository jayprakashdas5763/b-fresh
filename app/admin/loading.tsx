export default function Loading() {
    return (
        <div className="min-h-screen space-y-6 bg-[#fffdf7] transition-colors dark:bg-[#07140d]">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200 dark:bg-green-900/60" />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-green-900 dark:bg-green-950/70">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-green-900/60" />
                <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-green-950/70" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-green-900 dark:bg-green-950/70"
                    >
                        <div className="aspect-video animate-pulse bg-gray-100 dark:bg-green-900/50" />

                        <div className="space-y-3 p-5">
                            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-green-900/60" />
                            <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-green-950/70" />
                            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-100 dark:bg-green-950/70" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}