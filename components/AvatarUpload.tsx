// components/AvatarUpload.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { FiCamera, FiUpload, FiX } from "react-icons/fi";
import Avatar from "@/components/Avatar";
import { useToast } from "@/contexts/ToastContext";

type AvatarUploadProps = {
  currentAvatar?: string | null;
  fallbackText?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  loading?: boolean;
};

export default function AvatarUpload({
  currentAvatar,
  fallbackText,
  onUpload,
  onRemove,
  loading = false,
}: AvatarUploadProps) {
  const { showToast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(null);
  }, [currentAvatar]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      void handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (PNG, JPG, GIF, WebP)", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be smaller than 2MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    await onUpload(file);
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setPreview(null);
    await onRemove();
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative shrink-0">
        <Avatar
          src={displayAvatar}
          fallbackText={fallbackText}
          size="xl"
          className="ring-2 ring-white/[0.1]"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          aria-label="Upload new photo"
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-[#050608] transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          <FiCamera className="h-4 w-4" />
        </button>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative flex-1 rounded-xl border border-dashed p-3.5 text-center transition-colors sm:text-left ${
          dragActive
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-white/[0.12] bg-[#050608]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5">
            <FiUpload className="h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-200">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  Choose image
                </button>{" "}
                or drag &amp; drop
              </p>
              <p className="text-[11px] text-slate-400">
                PNG, JPG, GIF, WebP up to 2MB
              </p>
            </div>
          </div>

          {currentAvatar && onRemove && (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={loading}
              className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              <FiX className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
