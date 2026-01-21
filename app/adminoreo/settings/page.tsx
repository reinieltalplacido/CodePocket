"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiLogOut,
  FiDatabase,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import AdminSidebar from "@/components/AdminSidebar";


export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const password = sessionStorage.getItem("admin_password");
    if (!password) {
      router.push("/adminoreo");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    const password = sessionStorage.getItem("admin_password");
    
    if (password) {
      try {
        await fetch("/api/logs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "admin_logout",
            event_category: "security",
            metadata: {
              timestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (error) {
        console.error("Failed to log logout event:", error);
      }
    }

    sessionStorage.removeItem("admin_password");
    router.push("/adminoreo");
  };

  const performAction = async (action: string, confirmMessage: string) => {
    if (!confirm(confirmMessage)) return;

    const password = sessionStorage.getItem("admin_password");
    if (!password) return;

    setActionLoading(action);
    setActionMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "x-admin-password": password,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        setActionMessage({ type: "success", text: data.message || "Action completed successfully" });
      } else {
        setActionMessage({ type: "error", text: data.error || "Action failed" });
      }
    } catch (error) {
      console.error("Action error:", error);
      setActionMessage({ type: "error", text: "Failed to perform action" });
    } finally {
      setActionLoading(null);
      // Clear message after 5 seconds
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />
      
      <div className="ml-64 flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Database Maintenance</h1>
              <p className="text-slate-400">Manage and clean up your database</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Action Message */}
          {actionMessage && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-lg border p-4 ${
                actionMessage.type === "success"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {actionMessage.type === "success" ? (
                <FiCheckCircle className="h-5 w-5" />
              ) : (
                <FiAlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{actionMessage.text}</span>
            </div>
          )}

          {/* Database Maintenance */}
          <div className="mb-6 rounded-xl border border-white/10 bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-2 text-white">
              <FiDatabase className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Database Maintenance</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-950 p-4">
                <div>
                  <p className="font-medium text-white">Clear Old Logs</p>
                  <p className="text-sm text-slate-400">Delete logs older than 30 days</p>
                </div>
                <button
                  onClick={() =>
                    performAction(
                      "clear_old_logs",
                      "Are you sure you want to delete all logs older than 30 days? This action cannot be undone."
                    )
                  }
                  disabled={actionLoading === "clear_old_logs"}
                  className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                >
                  {actionLoading === "clear_old_logs" ? (
                    <>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="h-4 w-4" />
                      Clear Logs
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-950 p-4">
                <div>
                  <p className="font-medium text-white">Clear Deleted Snippets</p>
                  <p className="text-sm text-slate-400">Permanently delete soft-deleted snippets older than 30 days</p>
                </div>
                <button
                  onClick={() =>
                    performAction(
                      "clear_deleted_snippets",
                      "Are you sure you want to permanently delete all soft-deleted snippets older than 30 days? This action cannot be undone."
                    )
                  }
                  disabled={actionLoading === "clear_deleted_snippets"}
                  className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                >
                  {actionLoading === "clear_deleted_snippets" ? (
                    <>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="h-4 w-4" />
                      Clear Snippets
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <FiInfo className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <p className="font-medium text-blue-400">Important Information</p>
                <p className="mt-1 text-sm text-blue-300">
                  All maintenance actions are irreversible. Please ensure you have proper backups before performing any
                  database maintenance operations. The system will automatically log all administrative actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
