// components/UserProfileCard.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import Avatar from "./Avatar";
import { FiCalendar, FiEdit2, FiX, FiLogOut } from "react-icons/fi";

type UserProfileCardProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
};

type Profile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export default function UserProfileCard({
  isOpen,
  onClose,
  onEditProfile,
}: UserProfileCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserEmail(user.email || "");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.username) return profile.username;
    return userEmail.split("@")[0];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Profile Card */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
        <div className="animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black shadow-2xl">
          {/* Header with gradient background */}
          <div className="relative h-24 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-black/60"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          {/* Profile content */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="inline-block rounded-full bg-black p-2">
                <Avatar
                  src={profile?.avatar_url || undefined}
                  fallbackText={getDisplayName()}
                  size="2xl"
                  className="ring-4 ring-black"
                />
              </div>
            </div>

            {/* User info */}
            <div className="mb-4">
              <h2 className="mb-1 text-2xl font-bold text-white">
                {getDisplayName()}
              </h2>
              {profile?.username && (
                <p className="text-sm text-slate-400">@{profile.username}</p>
              )}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div className="mb-4 rounded-lg bg-white/5 p-3">
                <p className="text-sm text-slate-300">{profile.bio}</p>
              </div>
            )}

            {/* Member since */}
            <div className="mb-4 rounded-lg border border-white/10 bg-black p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Member Since
              </h3>
              <div className="flex items-center gap-2 text-slate-300">
                <FiCalendar className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium">
                  {profile?.created_at
                    ? formatDate(profile.created_at)
                    : "Unknown"}
                </span>
              </div>
            </div>

            {/* Edit Profile button */}
            <button
              onClick={() => {
                onClose();
                onEditProfile();
              }}
              className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-emerald-400"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit Profile
            </button>

            {/* Logout button */}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
            >
              <FiLogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
