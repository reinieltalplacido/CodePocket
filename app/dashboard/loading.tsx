export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
          <div className="mt-2 h-4 w-32 animate-pulse rounded bg-white/5" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-white/5" />
      </div>

      {/* Search Skeleton */}
      <div className="h-11 w-full animate-pulse rounded-lg bg-white/5" />

      {/* Snippets Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[380px] animate-pulse rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <div className="mb-3 h-6 w-3/4 rounded bg-white/10" />
            <div className="mb-4 h-4 w-1/2 rounded bg-white/10" />
            <div className="h-[200px] rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
