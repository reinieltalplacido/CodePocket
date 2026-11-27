// components/Toast.tsx
"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

type ToastType = "success" | "error" | "info";

type ToastProps = {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
};

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 3200,
}: ToastProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 170);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  const icons = {
    success: <FiCheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />,
    error: <FiAlertCircle className="h-4 w-4 shrink-0 text-red-400" />,
    info: <FiInfo className="h-4 w-4 shrink-0 text-sky-400" />,
  };

  const surfaces = {
    success: "border-emerald-500/35 bg-[#0D1015]/95",
    error: "border-red-500/35 bg-[#0D1015]/95",
    info: "border-sky-500/35 bg-[#0D1015]/95",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed left-1/2 top-4 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2"
    >
      <div
        className={`pointer-events-auto flex w-full items-center gap-3 rounded-xl border px-4 py-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.9)] backdrop-blur-md ${
          surfaces[type]
        } ${isClosing ? "cp-toast-out" : "cp-toast-in"}`}
      >
        {icons[type]}
        <p className="flex-1 text-sm font-medium text-slate-100">{message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
