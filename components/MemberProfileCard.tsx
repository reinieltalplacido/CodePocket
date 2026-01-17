// components/MemberProfileCard.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import Avatar from "./Avatar";
import { FiCalendar, FiEdit2, FiX, FiLogOut } from "react-icons/fi";

type MemberProfileCardProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onEditProfile?: () => void; // Only shown if viewing own profile
};

type Profile = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export default function MemberProfileCard({
  isOpen,
  onClose,
  userId,
  onEditProfile,
}: MemberProfileCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Check if this is the current user's profile
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setIsOwnProfile(currentUser?.id === userId);

      // If viewing own profile, use the profile API
      if (currentUser?.id === userId) {
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
          setUserEmail(currentUser.email || "");
        }
      } else {
        // For other users, fetch from profiles table directly
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileData) {
          // Get user's created_at from auth.users via a separate query
          // We'll use the profile's created_at as fallback
          setProfile({
            ...profileData,
            created_at: profileData.created_at || new Date().toISOString(),
          });
        }
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
            {loading ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400">Loading profile...</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
