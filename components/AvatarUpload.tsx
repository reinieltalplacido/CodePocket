// components/AvatarUpload.tsx
"use client";

import { useState, useRef } from "react";
import { FiUpload, FiX, FiCamera } from "react-icons/fi";
import Avatar from "./Avatar";

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
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await onUpload(file);
  };

  const handleRemove = async () => {
    if (onRemove) {
      setPreview(null);
      await onRemove();
    }
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <Avatar
          src={displayAvatar}
          fallbackText={fallbackText}
          size="xl"
          className="ring-2 ring-white/10"
        />
        
        {/* Camera Icon Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          <FiCamera className="h-4 w-4" />
        </button>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative w-full rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          dragActive
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-white/10 bg-white/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={loading}
          className="hidden"
        />

        <FiUpload className="mx-auto mb-2 h-6 w-6 text-slate-400" />
        <p className="text-sm text-slate-300">
          Drag & drop or{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
          >
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          PNG, JPG, GIF up to 2MB
        </p>
      </div>

      {/* Remove Button */}
      {displayAvatar && onRemove && (
        <button
          onClick={handleRemove}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          <FiX className="h-3 w-3" />
          Remove Avatar
        </button>
      )}
    </div>
  );
}
