"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

export type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  closing?: boolean;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }

    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, closing: true } : t))
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 170);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 3200) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        return next.slice(-3);
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }
    },
    [dismiss]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const iconMap = {
    success: <FiCheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />,
    error: <FiAlertCircle className="h-4 w-4 shrink-0 text-red-400" />,
    info: <FiInfo className="h-4 w-4 shrink-0 text-sky-400" />,
  };

  const borderMap = {
    success: "border-emerald-500/35 bg-[#0D1015]/95",
    error: "border-red-500/35 bg-[#0D1015]/95",
    info: "border-sky-500/35 bg-[#0D1015]/95",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Global Top-Center Toast Viewport */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col items-center gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full items-center gap-3 rounded-xl border px-4 py-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.9)] backdrop-blur-md ${
              borderMap[t.type]
            } ${t.closing ? "cp-toast-out" : "cp-toast-in"}`}
          >
            {iconMap[t.type]}
            <p className="flex-1 text-sm font-medium text-slate-100">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
