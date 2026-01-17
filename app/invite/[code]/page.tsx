// app/invite/[code]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { FiUsers, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import { supabase } from "@/lib/supabase-client";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default function InvitePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchInvitation();
  }, [resolvedParams.code]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/groups/invitations/${resolvedParams.code}`, {
        credentials: "include"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invitation not found");
      }

      setInvitation(data.invitation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/invite/${resolvedParams.code}`);
      return;
    }

    setAccepting(true);
    setError("");

    try {
      const response = await fetch(`/api/groups/invitations/${resolvedParams.code}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      // Redirect to the group
      router.push(`/dashboard/groups/${data.group_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    try {
      await fetch(`/api/groups/invitations/${resolvedParams.code}`, {
        method: "DELETE",
        credentials: "include",
      });
      router.push("/dashboard/groups");
    } catch (err: any) {
      console.error("Error declining invitation:", err);
      router.push("/dashboard/groups");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-sm text-slate-400">Loading invitation...</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
          <FiAlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
          <h1 className="mb-2 text-xl font-semibold text-red-400">
            Invalid Invitation
          </h1>
          <p className="mb-4 text-sm text-red-300">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/20"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-8 shadow-xl">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <FiUsers className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-center text-2xl font-bold text-slate-100">
          Group Invitation
        </h1>

        {/* Group Info */}
        {invitation && (
          <div className="mb-6 rounded-lg border border-white/10 bg-black p-4">
            <p className="mb-1 text-sm text-slate-400">You've been invited to join</p>
            <h2 className="mb-2 text-lg font-semibold text-slate-100">
              {invitation.groups?.name}
            </h2>
            {invitation.groups?.description && (
              <p className="text-sm text-slate-400">
                {invitation.groups.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span>Invited by {invitation.inviter?.email}</span>
            </div>
          </div>
        )}

        {/* Auth Warning */}
        {!isAuthenticated && (
          <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-300">
            You need to log in to accept this invitation
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={accepting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
          >
            <FiX className="h-4 w-4" />
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiCheck className="h-4 w-4" />
            {accepting ? "Accepting..." : isAuthenticated ? "Accept" : "Log in & Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
