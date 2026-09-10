export default function StoreLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <section className="overflow-hidden bg-gradient-to-br from-green-50 via-white to-lime-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="h-4 w-28 animate-pulse rounded-full bg-green-100" />

              <div className="space-y-3">
                <div className="h-12 w-full max-w-xl animate-pulse rounded-xl bg-gray-200" />
                <div className="h-12 w-4/5 max-w-lg animate-pulse rounded-xl bg-gray-200" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-full max-w-lg animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-5/6 max-w-md animate-pulse rounded bg-gray-100" />
              </div>

              <div className="flex gap-3 pt-3">
                <div className="h-12 w-40 animate-pulse rounded-full bg-green-100" />
                <div className="h-12 w-40 animate-pulse rounded-full bg-gray-100" />
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="aspect-square animate-pulse rounded-[2rem] bg-green-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-gray-100 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-5">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="aspect-[1.5] animate-pulse bg-gray-100" />

              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="bg-gray-50/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 space-y-2">
            <div className="h-7 w-52 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-80 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-square animate-pulse bg-gray-100" />

                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-11 w-full animate-pulse rounded-2xl bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}