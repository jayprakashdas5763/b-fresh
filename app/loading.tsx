export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-green-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-green-700" />
        </div>

        <p className="mt-4 text-sm font-semibold text-gray-800">
          Loading B-Fresh...
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Please wait a moment
        </p>
      </div>
    </main>
  );
}