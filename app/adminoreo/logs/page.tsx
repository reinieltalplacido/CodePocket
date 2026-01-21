"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FiActivity, 
  FiAlertCircle, 
  FiUsers, 
  FiFilter, 
  FiSearch, 
  FiLogOut, 
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiChevronDown,
  FiChevronUp,
  FiCalendar
} from "react-icons/fi";
import AdminSidebar from "@/components/AdminSidebar";

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
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export default function AdminLogsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    const password = sessionStorage.getItem("admin_password");
    if (!password) {
      router.push("/adminoreo");
      return;
    }

    fetchAnalytics(password);
  }, [router, currentPage, itemsPerPage, filter, dateRange, customStartDate, customEndDate]);

  const getDateRangeParams = () => {
    const now = new Date();
    let startDate = "";
    let endDate = "";

    switch (dateRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        break;
      case "last7days":
        startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
        break;
      case "last30days":
        startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
        break;
      case "custom":
        startDate = customStartDate ? new Date(customStartDate).toISOString() : "";
        endDate = customEndDate ? new Date(customEndDate).toISOString() : "";
        break;
    }

    return { startDate, endDate };
  };

  const fetchAnalytics = async (password: string, isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    }

    try {
      const { startDate, endDate } = getDateRangeParams();
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        category: filter,
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/logs/analytics?${params}`, {
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
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const password = sessionStorage.getItem("admin_password");
    if (!password) return;

    const interval = setInterval(() => {
      fetchAnalytics(password, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage, filter, dateRange, customStartDate, customEndDate]);

  const handleLogout = async () => {
    const password = sessionStorage.getItem("admin_password");
    
    // Log the logout event
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

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const exportLogs = (format: "csv" | "json") => {
    if (!analytics?.recentLogs) return;

    const logs = filteredLogs || [];

    if (format === "json") {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logs-${new Date().toISOString()}.json`;
      link.click();
    } else if (format === "csv") {
      const headers = ["Time", "Category", "Event", "User ID", "IP Address"];
      const csvRows = [
        headers.join(","),
        ...logs.map((log) =>
          [
            new Date(log.created_at).toISOString(),
            log.event_category,
            log.event_type,
            log.user_id || "",
            log.ip_address,
          ].join(",")
        ),
      ];
      const csvStr = csvRows.join("\n");
      const dataBlob = new Blob([csvStr], { type: "text/csv" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `logs-${new Date().toISOString()}.csv`;
      link.click();
    }
  };

  const filteredLogs = analytics?.recentLogs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
              <h1 className="text-3xl font-bold text-white">System Logs</h1>
              <div className="flex items-center gap-2">
                <p className="text-slate-400">Real-time monitoring and analytics</p>
                <span className="text-xs text-slate-500">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
                {isRefreshing && (
                  <FiRefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                )}
              </div>
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

          {/* Date Range Filter */}
          <div className="mb-6 rounded-xl border border-white/10 bg-slate-900 p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-300">
              <FiCalendar className="h-4 w-4" />
              <span className="text-sm font-medium">Date Range</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setDateRange("all")}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  dateRange === "all"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateRange("today")}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  dateRange === "today"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateRange("last7days")}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  dateRange === "last7days"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRange("last30days")}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  dateRange === "last30days"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateRange("custom")}
                className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                  dateRange === "custom"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                Custom Range
              </button>
            </div>

            {dateRange === "custom" && (
              <div className="mt-4 flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-400">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filters and Export */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="h-4 w-4 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
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

            <div className="flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
                <option value="200">200 per page</option>
              </select>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  const menu = document.getElementById("export-menu");
                  menu?.classList.toggle("hidden");
                }}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white transition-colors hover:bg-white/5"
              >
                <FiDownload className="h-4 w-4" />
                Export
              </button>
              <div
                id="export-menu"
                className="absolute right-0 top-full z-10 mt-2 hidden w-32 rounded-lg border border-white/10 bg-slate-900 py-1 shadow-xl"
              >
                <button
                  onClick={() => {
                    exportLogs("csv");
                    document.getElementById("export-menu")?.classList.add("hidden");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    exportLogs("json");
                    document.getElementById("export-menu")?.classList.add("hidden");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5"
                >
                  Export JSON
                </button>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-slate-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">
                      <div className="w-8"></div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">User ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs?.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr
                        className="cursor-pointer hover:bg-white/5"
                        onClick={() => toggleRowExpansion(log.id)}
                      >
                        <td className="px-4 py-3">
                          {expandedRows.has(log.id) ? (
                            <FiChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <FiChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              log.event_category === "auth"
                                ? "bg-blue-500/20 text-blue-400"
                                : log.event_category === "error"
                                ? "bg-red-500/20 text-red-400"
                                : log.event_category === "security"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-emerald-500/20 text-emerald-400"
                            }`}
                          >
                            {log.event_category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">{log.event_type}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">
                          {log.user_id ? log.user_id.substring(0, 8) + "..." : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400">{log.ip_address}</td>
                      </tr>
                      {expandedRows.has(log.id) && (
                        <tr className="bg-slate-950/50">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="space-y-3">
                              <div>
                                <p className="mb-1 text-xs font-medium text-slate-400">Full User ID</p>
                                <p className="text-sm text-white">{log.user_id || "N/A"}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium text-slate-400">User Agent</p>
                                <p className="text-sm text-white">{log.user_agent}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-medium text-slate-400">Metadata</p>
                                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-300">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {analytics?.pagination && analytics.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, analytics.pagination.totalItems)} of{" "}
                {analytics.pagination.totalItems} results
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, analytics.pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (analytics.pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= analytics.pagination.totalPages - 2) {
                      pageNum = analytics.pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-9 w-9 rounded-lg text-sm transition-colors ${
                          currentPage === pageNum
                            ? "bg-emerald-500 text-white"
                            : "border border-white/10 bg-slate-900 text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(analytics.pagination.totalPages, p + 1))}
                  disabled={currentPage === analytics.pagination.totalPages}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white transition-colors hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
