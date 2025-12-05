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
  duration = 3000,
}: ToastProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

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
    success: <FiCheckCircle className="h-5 w-5 text-emerald-400" />,
    error: <FiAlertCircle className="h-5 w-5 text-red-400" />,
    info: <FiInfo className="h-5 w-5 text-blue-400" />,
  };

  const bgColors = {
    success: "bg-emerald-500/10 border-emerald-500/20",
    error: "bg-red-500/10 border-red-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out ${
        isAnimating
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex min-w-[320px] items-center gap-3 rounded-lg border ${bgColors[type]} p-4 shadow-xl backdrop-blur-sm`}
      >
        {icons[type]}
        <p className="flex-1 text-sm text-slate-100">{message}</p>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-slate-100"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
