// components/Avatar.tsx
"use client";

import { FiUser } from "react-icons/fi";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  fallbackText?: string;
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-24 w-24 text-2xl",
};

export default function Avatar({
  src,
  alt = "User avatar",
  size = "md",
  fallbackText,
  className = "",
}: AvatarProps) {
  const getInitials = (text?: string) => {
    if (!text) return "";
    const parts = text.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(fallbackText);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Hide image on error and show fallback
            e.currentTarget.style.display = "none";
          }}
        />
      ) : initials ? (
        <span className="font-semibold text-white">{initials}</span>
      ) : (
        <FiUser className="h-1/2 w-1/2 text-white" />
      )}
    </div>
  );
}
