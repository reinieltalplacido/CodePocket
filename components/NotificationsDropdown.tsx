// components/NotificationsDropdown.tsx
"use client";

import { FiBell } from "react-icons/fi";

export default function NotificationsDropdown() {
  return (
    <button
      className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
      title="Notifications"
    >
      <FiBell className="h-5 w-5" />
    </button>
  );
}
