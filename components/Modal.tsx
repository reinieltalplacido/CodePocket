// components/Modal.tsx
"use client";

import { useEffect, useId, useRef, useState, ReactNode } from "react";
import { FiX } from "react-icons/fi";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "large";
  noBodyPadding?: boolean;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  noBodyPadding = false,
}: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const titleId = useId();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setShouldRender(true);
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else if (shouldRender) {
      setIsClosing(true);
      document.body.style.overflow = "";
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        previousFocusRef.current?.focus?.();
      }, 165);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, shouldRender]);

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

  if (!shouldRender) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    large: "max-w-5xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-[4px] ${
          isClosing ? "cp-backdrop-out" : "cp-backdrop-in"
        }`}
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div
        className={`relative w-full ${sizeClasses[size]} ${
          isClosing ? "cp-modal-out" : "cp-modal-in"
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#0A0D12] shadow-[0_28px_70px_-16px_rgba(0,0,0,0.95)]">
          {/* Header */}
          {title && (
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] bg-[#090B0E] px-5 py-4 sm:px-6">
              <div>
                <h2 id={titleId} className="text-base font-semibold text-slate-100 sm:text-lg">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Content */}
          <div
            className={`custom-scrollbar max-h-[calc(100dvh-7rem)] overflow-y-auto ${
              title && !noBodyPadding ? "p-5 sm:p-6" : ""
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
