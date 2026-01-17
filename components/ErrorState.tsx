// components/ErrorState.tsx
"use client";

import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  fullScreen?: boolean;
};

export default function ErrorState({ 
  title = "Oops!",
  message = "Something went wrong", 
  onRetry,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  fullScreen = false 
}: ErrorStateProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
    : "flex items-center justify-center py-12";

  // Use onAction if provided, otherwise fall back to onRetry
  const primaryAction = onAction || onRetry;
  const primaryLabel = actionLabel || "Try Again";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-500/10 p-4">
          <FiAlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <p className="max-w-md text-sm text-slate-400">{message}</p>
        </div>
        <div className="flex items-center gap-3">
          {primaryAction && (
            <button
              onClick={primaryAction}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
            >
              <FiRefreshCw className="h-4 w-4" />
              {primaryLabel}
            </button>
          )}
          {onSecondaryAction && secondaryActionLabel && (
            <button
              onClick={onSecondaryAction}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
