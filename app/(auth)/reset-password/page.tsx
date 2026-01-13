"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { validatePassword } from "@/lib/validation";
import { FiEye, FiEyeOff, FiAlertCircle, FiLoader, FiCheck, FiX, FiLock } from "react-icons/fi";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    
    if (value.length > 0) {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength || null);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setErrorMsg(passwordValidation.error || 'Invalid password');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // Success - redirect to dashboard
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
              <FiLock className="h-7 w-7 text-white" />
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
              Reset Password
            </h1>
            <p className="text-sm text-slate-400">
              Choose a new strong password for your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password field */}
            <div className="group">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
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
              
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength ? 'bg-red-500' : 'bg-white/10'
                    }`} />
                    <div className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-white/10'
                    }`} />
                    <div className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-white/10'
                    }`} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Strength: <span className={`font-medium ${
                      passwordStrength === 'weak' ? 'text-red-400' :
                      passwordStrength === 'medium' ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}>
                      {passwordStrength || 'weak'}
                    </span>
                  </p>
                </div>
              )}
              
              {/* Password requirements */}
              <div className="mt-3 space-y-1">
                <PasswordRequirement 
                  met={password.length >= 8} 
                  text="At least 8 characters" 
                />
                <PasswordRequirement 
                  met={/[A-Z]/.test(password)} 
                  text="One uppercase letter" 
                />
                <PasswordRequirement 
                  met={/[a-z]/.test(password)} 
                  text="One lowercase letter" 
                />
                <PasswordRequirement 
                  met={/[0-9]/.test(password)} 
                  text="One number" 
                />
                <PasswordRequirement 
                  met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)} 
                  text="One special character" 
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="group">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500/50' : 'border-white/10'
                  } bg-white/5 px-4 py-3 pr-12 text-sm text-white outline-none ring-emerald-500/40 transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-500/50 focus:bg-white/10 focus:ring-4`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-300"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-4 w-4" />
                  ) : (
                    <FiEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
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
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </form>
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

// Helper component for password requirements
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <FiCheck className="h-3 w-3 text-emerald-400" />
      ) : (
        <FiX className="h-3 w-3 text-slate-500" />
      )}
      <span className={met ? 'text-emerald-400' : 'text-slate-500'}>
        {text}
      </span>
    </div>
  );
}
