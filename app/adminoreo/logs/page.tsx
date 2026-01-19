"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiActivity, FiAlertCircle, FiUsers, FiFilter, FiSearch, FiLogOut } from "react-icons/fi";

type Log = {
  id: string;
  user_id: string | null;
  event_type: string;
  event_category: string;
  metadata: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
};

type Analytics = {
  totalEvents: number;
  byCategory: Record<string, number>;
  recentLogs: Log[];
};

export default function AdminLogsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const password = sessionStorage.getItem("admin_password");
    if (!password) {
      router.push("/adminoreo");
      return;
    }

    fetchAnalytics(password);
  }, [router]);

  const fetchAnalytics = async (password: string) => {
    try {
      const response = await fetch("/api/logs/analytics", {
        headers: {
          "x-admin-password": password,
        },
      });

      if (!response.ok) {
        router.push("/adminoreo");
        return;
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_password");
    router.push("/adminoreo");
  };

  const filteredLogs = analytics?.recentLogs.filter((log) => {
    const matchesFilter = filter === "all" || log.event_category === filter;
    const matchesSearch =
      searchTerm === "" ||
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">System logs and analytics</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
            <div className="mb-2 flex items-center gap-2 text-emerald-400">
              <FiActivity className="h-5 w-5" />
              <span className="text-sm font-medium">Total Events</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.totalEvents || 0}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
            <div className="mb-2 flex items-center gap-2 text-blue-400">
              <FiUsers className="h-5 w-5" />
              <span className="text-sm font-medium">Auth Events</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.byCategory?.auth || 0}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
            <div className="mb-2 flex items-center gap-2 text-yellow-400">
              <FiAlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.byCategory?.error || 0}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
            <div className="mb-2 flex items-center gap-2 text-purple-400">
              <FiFilter className="h-5 w-5" />
              <span className="text-sm font-medium">Security</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics?.byCategory?.security || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="auth">Auth</option>
              <option value="snippet">Snippet</option>
              <option value="group">Group</option>
              <option value="error">Error</option>
              <option value="security">Security</option>
            </select>
          </div>

          <div className="flex flex-1 items-center gap-2">
            <FiSearch className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-slate-950">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs?.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        log.event_category === 'auth' ? 'bg-blue-500/20 text-blue-400' :
                        log.event_category === 'error' ? 'bg-red-500/20 text-red-400' :
                        log.event_category === 'security' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {log.event_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{log.event_type}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {log.user_id ? log.user_id.substring(0, 8) + "..." : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
