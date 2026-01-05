import Link from "next/link";
import { FiSearch } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <FiSearch className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        <h1 className="mb-2 text-6xl font-bold text-slate-100">404</h1>
        <h2 className="mb-2 text-xl font-semibold text-slate-200">
          Page not found
        </h2>
        <p className="mb-6 text-sm text-slate-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
