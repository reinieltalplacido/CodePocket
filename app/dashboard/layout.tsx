// app/dashboard/layout.tsx
"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import ProfileModal from "@/components/ProfileModal";
import AddFolderModal from "@/components/AddFolderModal";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCode,
  FiStar,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiFolder,
  FiPlus,
  FiTrash2,
  FiHelpCircle,
} from "react-icons/fi";

type Folder = {
  id: string;
  name: string;
  color: string;
  snippet_count?: number;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: foldersData } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (foldersData) {
      // Get snippet count for each folder
      const foldersWithCount = await Promise.all(
        foldersData.map(async (folder) => {
          const { count } = await supabase
            .from("snippets")
            .select("*", { count: "exact", head: true })
            .eq("folder_id", folder.id);

          return { ...folder, snippet_count: count || 0 };
        })
      );

      setFolders(foldersWithCount);
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      emerald: "bg-emerald-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
    };
    return colors[color] || colors.emerald;
  };

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-black text-slate-50">
      {/* Sidebar */}
      <aside
        className={`group relative flex flex-col border-r border-white/10 bg-black transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black text-slate-400 opacity-0 shadow-lg transition-all hover:bg-slate-900 hover:text-slate-100 group-hover:opacity-100"
        >
          {collapsed ? (
            <FiChevronRight className="h-3 w-3" />
          ) : (
            <FiChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <span className="text-base font-bold text-white">CP</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-slate-100">
              CodePocket
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          <SidebarItem
            icon={<FiCode className="h-5 w-5" />}
            label="All Snippets"
            collapsed={collapsed}
            active={pathname === "/dashboard"}
            onClick={() => router.push("/dashboard")}
          />
          <SidebarItem
            icon={<FiStar className="h-5 w-5" />}
            label="Favorites"
            collapsed={collapsed}
            active={pathname === "/dashboard/favorites"}
            onClick={() => router.push("/dashboard/favorites")}
          />
          <SidebarItem
            icon={<FiTrash2 className="h-5 w-5" />}
            label="Archive"
            collapsed={collapsed}
            active={pathname === "/dashboard/archive"}
            onClick={() => router.push("/dashboard/archive")}
          />
          <SidebarItem
            icon={<FiHelpCircle className="h-5 w-5" />}
            label="Help"
            collapsed={collapsed}
            active={pathname === "/dashboard/help"}
            onClick={() => router.push("/dashboard/help")}
          />

          {/* Folders Section */}
          {!collapsed && (
            <>
              <div className="mb-2 mt-6 flex items-center justify-between px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Folders
                </span>
                <button
                  onClick={() => setShowFolderModal(true)}
                  className="rounded p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
                  title="New Folder"
                >
                  <FiPlus className="h-3.5 w-3.5" />
                </button>
              </div>

              {folders.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-500">
                  No folders yet
                </div>
              ) : (
                folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => router.push(`/dashboard/folder/${folder.id}`)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      pathname === `/dashboard/folder/${folder.id}`
                        ? "bg-white/5 text-emerald-400"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 shrink-0 rounded-full ${getColorClass(
                        folder.color
                      )}`}
                    />
                    <span className="flex-1 truncate text-left">{folder.name}</span>
                    {folder.snippet_count! > 0 && (
                      <span className="text-xs text-slate-500">
                        {folder.snippet_count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </>
          )}

          {collapsed && folders.length > 0 && (
            <SidebarItem
              icon={<FiFolder className="h-5 w-5" />}
              label="Folders"
              collapsed={collapsed}
              onClick={() => setCollapsed(false)}
            />
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden bg-black">
        {/* Top navbar */}
        <header className="border-b border-white/10 bg-black">
          <div className="flex items-center justify-between px-6 py-3">
            <h1 className="text-lg font-semibold text-slate-100">Dashboard</h1>
            <div className="flex items-center gap-3">
              <ThemeSelector />
              <UserMenu onOpenProfile={() => setShowProfileModal(true)} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
        </div>
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Add Folder Modal */}
      <AddFolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        onSuccess={() => {
          setShowFolderModal(false);
          fetchFolders();
        }}
      />
    </div>
    </ThemeProvider>
  );
}

type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
};

function SidebarItem({
  icon,
  label,
  collapsed,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-white/5 text-emerald-400"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : ""}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

function UserMenu({ onOpenProfile }: { onOpenProfile: () => void }) {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const getInitial = () => {
    return userEmail ? userEmail.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all hover:bg-white/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-400">
          {getInitial()}
        </div>
        <FiChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-white/10 bg-black shadow-xl">
          <div className="p-2">
            <div className="mb-2 border-b border-white/10 px-3 py-2">
              <p className="truncate text-xs text-slate-400">{userEmail}</p>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                onOpenProfile();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <FiUser className="h-4 w-4" />
              Profile
            </button>
            <hr className="my-1 border-white/10" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-white/5"
            >
              <FiLogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

