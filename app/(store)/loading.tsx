export default function StoreLoading() {
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-white">
      <section className="animate-pulse border-b border-green-100 bg-green-50/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-8 w-2/3 max-w-xl rounded-lg bg-green-100" />
          <div className="mt-3 h-4 w-full max-w-lg rounded bg-green-100" />

          <div className="mt-6 flex gap-3">
            <div className="h-11 w-36 rounded-full bg-green-100" />
            <div className="h-11 w-36 rounded-full bg-green-100" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
            >
              <div className="aspect-square animate-pulse bg-gray-100" />

              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}