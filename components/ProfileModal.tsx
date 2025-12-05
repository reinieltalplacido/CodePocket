// components/ProfileModal.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  useEffect(() => {
    if (isOpen) {
      const fetchUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email || "");
          setDisplayName(user.user_metadata?.display_name || "");
        }
      };
      fetchUser();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    });

    setLoading(false);

    if (error) {
      setToast({
        show: true,
        message: error.message,
        type: "error",
      });
      return;
    }

    setToast({
      show: true,
      message: "Profile updated successfully!",
      type: "success",
    });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Profile Settings" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-slate-100 outline-none ring-emerald-500/60 focus:border-emerald-500 focus:ring-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </>
  );
}
