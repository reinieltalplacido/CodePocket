"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { validateEmail, validatePassword } from "@/lib/validation";
import { logger } from "@/lib/logger";
import { FiEye, FiEyeOff, FiAlertCircle, FiLoader, FiCheck, FiX } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
    
    if (value.length > 0) {
      const validation = validateEmail(value);
      if (!validation.valid) {
        setEmailError(validation.error || null);
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    
    if (value.length > 0) {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength || null);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (bottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    setShowTermsModal(false);
    setHasScrolledToBottom(false); // Reset for next time
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
      // If successful, user will be redirected to Google
    } catch (err) {
      setErrorMsg('Failed to initialize Google sign-in');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Check if terms have been accepted
    if (!hasAcceptedTerms) {
      setErrorMsg('Please accept the Terms of Service to continue');
      return;
    }

    // Validate username
    if (!username || username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters');
      return;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setErrorMsg(emailValidation.error || 'Invalid email');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setErrorMsg(passwordValidation.error || 'Invalid password');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMsg(error.message);
      return;
    }

    // Create profile with username
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          username: username.trim(),
          display_name: username.trim(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't block signup if profile creation fails
      }

      // Log successful signup
      logger.auth.signup(data.user.id, { username: username.trim(), email });
    }

    setLoading(false);
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
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <span className="text-2xl font-bold text-white">CP</span>
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
              Create your account
            </h1>
            <p className="text-sm text-slate-400">
              Save and manage all your favorite snippets in one place
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username field */}
            <div className="group">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Juan"
                className={`w-full rounded-lg border ${
                  usernameError ? 'border-red-500/50' : 'border-white/10'
                } bg-white/5 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-500/50 focus:bg-white/10 focus:ring-4`}
              />
              {usernameError && (
                <p className="mt-1 text-xs text-red-400">{usernameError}</p>
              )}
            </div>

            {/* Email field */}
            <div className="group">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="you@example.com"
                className={`w-full rounded-lg border ${
                  emailError ? 'border-red-500/50' : 'border-white/10'
                } bg-white/5 px-4 py-3 text-sm text-white outline-none ring-emerald-500/40 transition-all placeholder:text-slate-500 hover:border-white/20 focus:border-emerald-500/50 focus:bg-white/10 focus:ring-4`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-400">{emailError}</p>
              )}
            </div>

            {/* Password field */}
            <div className="group">
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
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
              {password.length > 0 && (
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
              )}
            </div>

            {/* Terms of Service */}
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
              {hasAcceptedTerms ? (
                <FiCheck className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              ) : (
                <div className="h-4 w-4 flex-shrink-0 rounded border-2 border-white/20" />
              )}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className={`text-sm transition-colors ${
                  hasAcceptedTerms
                    ? 'text-slate-300 hover:text-white'
                    : 'text-emerald-400 underline hover:text-emerald-300'
                }`}
              >
                {hasAcceptedTerms ? 'Terms accepted' : 'Accept Terms of Service'}
              </button>
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
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-400 to-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 shadow-2xl backdrop-blur-xl">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              onScroll={handleTermsScroll}
              className="max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-300 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-900 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-slate-600"
            >
              <h3 className="mb-3 text-lg font-semibold text-white">1. Acceptance of Terms</h3>
              <p className="mb-4">
                By accessing and using CodePocket, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">2. Use License</h3>
              <p className="mb-4">
                Permission is granted to temporarily use CodePocket for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">3. User Account</h3>
              <p className="mb-4">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">4. Content</h3>
              <p className="mb-4">
                You retain all rights to the code snippets and content you upload to CodePocket. We do not claim ownership of your content. However, by using our service, you grant us the right to store and display your content.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">5. Privacy</h3>
              <p className="mb-4">
                Your privacy is important to us. We collect and use your information in accordance with our Privacy Policy. We do not sell your personal information to third parties.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">6. Prohibited Uses</h3>
              <p className="mb-4">
                You may not use CodePocket for any illegal or unauthorized purpose. You must not, in the use of the service, violate any laws in your jurisdiction.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">7. Termination</h3>
              <p className="mb-4">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">8. Limitation of Liability</h3>
              <p className="mb-4">
                CodePocket shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">9. Changes to Terms</h3>
              <p className="mb-4">
                We reserve the right to modify or replace these terms at any time. It is your responsibility to check these terms periodically for changes.
              </p>

              <h3 className="mb-3 text-lg font-semibold text-white">10. Contact</h3>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us through the application.
              </p>

              <p className="mt-6 text-center text-xs text-slate-500">
                Last updated: January 2026
              </p>
            </div>

            {/* Scroll Indicator */}
            {!hasScrolledToBottom && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
                <span>Scroll to bottom to accept</span>
                <span className="animate-bounce">↓</span>
              </div>
            )}

            {/* Accept Button */}
            <button
              onClick={handleAcceptTerms}
              disabled={!hasScrolledToBottom}
              className="mt-4 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-black shadow-lg transition-all hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {hasScrolledToBottom ? 'Accept Terms' : 'Scroll to Accept'}
            </button>
          </div>
        </div>
      )}

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
