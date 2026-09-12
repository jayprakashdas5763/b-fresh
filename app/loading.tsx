export default function Loading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 transition-colors dark:bg-[#07140d]">
            <div className="flex flex-col items-center text-center">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-green-100 dark:border-green-950" />

                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-green-700 dark:border-t-lime-400" />
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-800 dark:text-green-100">
                    Loading B-Fresh...
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-green-300/70">
                    Please wait a moment
                </p>
            </div>
        </main>
    );
}