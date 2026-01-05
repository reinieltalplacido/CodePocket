"use client";

import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <FiAlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-100">
          Something went wrong!
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/5"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
