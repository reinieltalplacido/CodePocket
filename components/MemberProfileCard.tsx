// components/MemberProfileCard.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import Avatar from "@/components/Avatar";
import Modal from "@/components/Modal";
import { FiCalendar, FiX } from "react-icons/fi";

type MemberProfileCardProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onEditProfile?: () => void;
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
}: MemberProfileCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      void fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser?.id === userId) {
        const response = await fetch("/api/profile", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          setUserEmail(currentUser.email || "");
        }
      } else {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileData) {
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
    return userEmail.split("@")[0] || "Member";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" noBodyPadding>
      <div className="overflow-hidden">
        <div className="relative h-24 border-b border-white/[0.08] bg-[#0D1015]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.16),transparent_65%)]" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close member profile"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#050608]/80 text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="relative px-6 pb-6">
          {loading ? (
            <div className="space-y-3 py-8">
              <div className="h-6 w-1/2 animate-pulse rounded bg-white/[0.08]" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-white/[0.06]" />
            </div>
          ) : (
            <>
              <div className="relative -mt-12 mb-4">
                <div className="inline-block rounded-full border border-white/[0.1] bg-[#0A0D12] p-1.5 shadow-xl">
                  <Avatar
                    src={profile?.avatar_url}
                    fallbackText={getDisplayName()}
                    size="2xl"
                    className="h-20 w-20 text-xl"
                  />
                </div>
              </div>

              <div className="mb-4">
                <h2 className="font-[family-name:var(--font-bricolage)] text-xl font-bold text-slate-100">
                  {getDisplayName()}
                </h2>
                {profile?.username && (
                  <p className="font-mono text-xs text-slate-400">@{profile.username}</p>
                )}
              </div>

              {profile?.bio && (
                <div className="mb-4 rounded-xl border border-white/[0.06] bg-[#050608] p-3">
                  <p className="text-xs leading-relaxed text-slate-300">{profile.bio}</p>
                </div>
              )}

              <div className="rounded-xl border border-white/[0.08] bg-[#050608] p-3.5">
                <p className="text-[11px] font-medium text-slate-400">Member Since</p>
                <div className="mt-1 flex items-center gap-2 text-slate-300">
                  <FiCalendar className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">
                    {profile?.created_at ? formatDate(profile.created_at) : "Unknown"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
