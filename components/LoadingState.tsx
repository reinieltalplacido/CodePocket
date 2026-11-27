// components/LoadingState.tsx
"use client";

import Spinner from "./Spinner";

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
  variant?: "cards" | "spinner";
};

export default function LoadingState({
  message = "Loading...",
  fullScreen = false,
  variant = "cards",
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-300">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-400">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div aria-busy="true" aria-label={message} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-xl border border-white/[0.06] bg-[#0D1015] p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="h-4 w-3/5 rounded bg-white/[0.08]" />
              <div className="h-5 w-16 rounded-md bg-emerald-500/10" />
            </div>
            <div className="mb-3 h-28 rounded-lg border border-white/[0.05] bg-[#050608]" />
            <div className="flex items-center justify-between border-t border-white/[0.05] pt-2.5">
              <div className="h-4 w-24 rounded bg-white/[0.06]" />
              <div className="flex gap-1.5">
                <div className="h-7 w-7 rounded-lg bg-white/[0.06]" />
                <div className="h-7 w-7 rounded-lg bg-white/[0.06]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
