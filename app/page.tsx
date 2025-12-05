import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4">
        {/* Navbar */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/40">
              <span className="text-lg font-bold text-emerald-400">CP</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              CodePocket
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 font-medium text-slate-200 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-400"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-1 flex-col items-start justify-center gap-10 py-10 md:flex-row md:items-center">
          <div className="space-y-6 md:w-1/2">
            <p className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
              Your personal code stash
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Save every useful{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                code snippet
              </span>{" "}
              in one place.
            </h1>
            <p className="text-pretty text-sm text-slate-300 sm:text-base">
              CodePocket keeps your favorite snippets organized, searchable, and
              ready to paste into your next project so you never rewrite the
              same code twice.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="rounded-md bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
              >
                Get started for free
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-200 underline-offset-4 hover:underline"
              >
                Already have an account? Log in
              </Link>
            </div>

            <ul className="mt-4 grid gap-2 text-xs text-slate-400 sm:text-sm">
              <li>• Supabase Auth, secure by default</li>
              <li>• Syntax-highlighted snippets</li>
              <li>• Tags, languages, and search coming soon</li>
            </ul>
          </div>

          {/* Fake code preview */}
          <div className="mt-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl shadow-emerald-500/10 md:mt-0">
            <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 text-[11px] text-slate-500">
                snippets/useDebounce.ts
              </span>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-950/60 p-4 text-xs leading-relaxed text-slate-100">
{`export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}`}
            </pre>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex items-center justify-between py-6 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} CodePocket</span>
          <span>Built with Next.js, Tailwind & Supabase</span>
        </footer>
      </div>
    </main>
  );
}
