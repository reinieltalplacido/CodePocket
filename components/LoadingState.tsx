// components/LoadingState.tsx
"use client";

import Spinner from "./Spinner";

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
};

export default function LoadingState({ 
  message = "Loading...", 
  fullScreen = false 
}: LoadingStateProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </div>
  );
}
