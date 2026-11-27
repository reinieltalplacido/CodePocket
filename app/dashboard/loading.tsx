export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-7 w-44 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="mt-2 h-4 w-28 animate-pulse rounded bg-white/[0.04]" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-white/[0.06]" />
      </div>

      <div className="h-11 w-full animate-pulse rounded-lg bg-white/[0.05]" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-white/[0.06] bg-[#0D1015] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="h-4 w-3/5 rounded bg-white/[0.08]" />
              <div className="h-5 w-16 rounded-md bg-emerald-500/10" />
            </div>
            <div className="mb-3 h-28 rounded-lg border border-white/[0.05] bg-[#050608]" />
            <div className="flex items-center justify-between border-t border-white/[0.05] pt-2.5">
              <div className="h-4 w-24 rounded bg-white/[0.06]" />
              <div className="h-7 w-20 rounded-lg bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
