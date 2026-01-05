"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { FiEye, FiEyeOff, FiAlertCircle, FiLoader, FiCheck } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Use the standard supabase client
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      {/* Animated background gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-blue-500/10 blur-3xl" style={{ animationDelay: "1s" }} />
      </div>

      {/* Auth card */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <span className="text-2xl font-bold text-white">CP</span>
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400">
              Log in to access your saved snippets
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="group">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-500/50 focus:bg-white/10 focus:ring-4"
              />
            </div>

            {/* Password field */}
            <div className="group">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white outline-none ring-emerald-500/40 transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-500/50 focus:bg-white/10 focus:ring-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-300"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Keep me signed in checkbox */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="keepSignedIn"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-white/20 bg-white/5 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-white/30 focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-0"
                />
                <FiCheck className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
              </div>
              <label
                htmlFor="keepSignedIn"
                className="cursor-pointer select-none text-sm text-slate-300 transition-colors hover:text-slate-200"
              >
                Keep me signed in
              </label>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 animate-shake">
                <FiAlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <p className="text-sm text-red-400">{errorMsg}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              New here?{" "}
              <Link
                href="/signup"
                className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </main>
  );
}
