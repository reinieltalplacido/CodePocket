// components/Modal.tsx
"use client";

import { useEffect, ReactNode } from "react";
import { FiX } from "react-icons/fi";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "large";
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    large: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300`}
      >
        <div className="rounded-xl border border-white/10 bg-black shadow-2xl">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className={`modal-content max-h-[calc(100vh-8rem)] overflow-y-auto ${title ? "px-6 py-4" : ""}`}>
            <style jsx>{`
              .modal-content::-webkit-scrollbar {
                width: 8px;
              }
              .modal-content::-webkit-scrollbar-track {
                background: transparent;
              }
              .modal-content::-webkit-scrollbar-thumb {
                background: #334155;
                border-radius: 4px;
              }
              .modal-content::-webkit-scrollbar-thumb:hover {
                background: #475569;
              }
            `}</style>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
