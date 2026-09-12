export default function Loading() {
    return (
        <main className="min-h-screen bg-[#fffdf7] px-4 py-8 dark:bg-[#07140d] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl animate-pulse">
                {/* Loading message */}
                <div className="mb-6">
                    <p className="text-sm font-semibold text-green-700 dark:text-lime-300">
                        Getting your product ready…
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Just a moment while we load the freshest details.
                    </p>
                </div>

                {/* Breadcrumb */}
                <div className="mb-6 h-4 w-48 rounded bg-gray-200 dark:bg-[#294436]" />

                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Product image */}
                    <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-[#102019]" />

                    {/* Product information */}
                    <div className="flex flex-col justify-center">
                        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-[#294436]" />

                        <div className="mt-4 h-10 w-4/5 rounded-lg bg-gray-200 dark:bg-[#294436]" />

                        <div className="mt-3 h-6 w-32 rounded bg-gray-200 dark:bg-[#294436]" />

                        <div className="mt-6 space-y-3">
                            <div className="h-4 w-full rounded bg-gray-200 dark:bg-[#294436]" />
                            <div className="h-4 w-11/12 rounded bg-gray-200 dark:bg-[#294436]" />
                            <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-[#294436]" />
                        </div>

                        <div className="mt-8 h-12 w-full rounded-xl bg-gray-200 dark:bg-[#294436]" />

                        <div className="mt-4 h-12 w-full rounded-xl bg-gray-200 dark:bg-[#294436]" />
                    </div>
                </div>
            </div>
        </main>
    );
}