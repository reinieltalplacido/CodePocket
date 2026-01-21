"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUsers,
  FiSearch,
  FiLogOut,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiCode,
  FiLayers,
} from "react-icons/fi";
import AdminSidebar from "@/components/AdminSidebar";

type User = {
  id: string;
  email: string;
  username: string;
  created_at: string;
  snippet_count: number;
  group_count: number;
  avatar_url?: string;
};

type UsersData = {
  users: User[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    const password = sessionStorage.getItem("admin_password");
    if (!password) {
      router.push("/adminoreo");
      return;
    }

    fetchUsers(password);
  }, [router, currentPage, itemsPerPage, searchTerm]);

  const fetchUsers = async (password: string, isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          "x-admin-password": password,
        },
      });

      if (!response.ok) {
        router.push("/adminoreo");
        return;
      }

      const data = await response.json();
      setUsersData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const password = sessionStorage.getItem("admin_password");
    if (!password) return;

    const interval = setInterval(() => {
      fetchUsers(password, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentPage, itemsPerPage, searchTerm]);

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
              <h1 className="text-3xl font-bold text-white">User Management</h1>
              <div className="flex items-center gap-2">
                <p className="text-slate-400">Manage and monitor all users</p>
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

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
              <div className="mb-2 flex items-center gap-2 text-blue-400">
                <FiUsers className="h-5 w-5" />
                <span className="text-sm font-medium">Total Users</span>
              </div>
              <p className="text-3xl font-bold text-white">{usersData?.pagination.totalItems || 0}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <FiCode className="h-5 w-5" />
                <span className="text-sm font-medium">Total Snippets</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {usersData?.users.reduce((sum, user) => sum + user.snippet_count, 0) || 0}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
              <div className="mb-2 flex items-center gap-2 text-purple-400">
                <FiLayers className="h-5 w-5" />
                <span className="text-sm font-medium">Total Groups</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {usersData?.users.reduce((sum, user) => sum + user.group_count, 0) || 0}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex flex-1 items-center gap-2">
              <FiSearch className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by email or username..."
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
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-slate-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">UID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Display name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Providers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Provider type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Created at</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Last sign in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersData?.users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className="text-xs font-mono text-slate-400">
                            {user.id.substring(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {user.username || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">-</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            Email
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">-</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })} {new Date(user.created_at).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false
                        })} GMT+0800
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {usersData?.pagination && usersData.pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, usersData.pagination.totalItems)} of{" "}
                {usersData.pagination.totalItems} users
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
                  {Array.from({ length: Math.min(5, usersData.pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (usersData.pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= usersData.pagination.totalPages - 2) {
                      pageNum = usersData.pagination.totalPages - 4 + i;
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
                  onClick={() => setCurrentPage((p) => Math.min(usersData.pagination.totalPages, p + 1))}
                  disabled={currentPage === usersData.pagination.totalPages}
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
