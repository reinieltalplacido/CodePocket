// app/dashboard/layout.tsx
"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import ProfileModal from "@/components/ProfileModal";
import UserProfileCard from "@/components/UserProfileCard";
import AddFolderModal from "@/components/AddFolderModal";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";
import NotificationsDropdown from "@/components/NotificationsDropdown";
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
  FiMenu,
  FiX,
  FiUsers,
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
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // No user found, redirect to login
        router.replace('/login');
        return;
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFolders();
    }
  }, [isAuthenticated]);

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

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-emerald-400">
            CodePocket
          </div>
          <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse bg-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-black text-slate-50">
      {/* Mobile backdrop overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`group fixed md:relative inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 bg-gradient-to-b from-zinc-950 to-black backdrop-blur-xl transition-all duration-300 ease-in-out ${
          collapsed ? "md:w-16" : "md:w-64"
        } ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-64`}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Collapse toggle button (desktop only) */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-8 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-zinc-900 to-black text-slate-400 opacity-0 shadow-lg transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 group-hover:opacity-100 md:flex"
        >
          {collapsed ? (
            <FiChevronRight className="h-3 w-3" />
          ) : (
            <FiChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/5 px-4 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <FiCode className="h-5 w-5 text-emerald-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-100">
                CodePocket
              </span>
              <span className="text-xs text-slate-500">Snippet Manager</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <SidebarItem
            icon={<FiCode className="h-5 w-5" />}
            label="All Snippets"
            collapsed={collapsed}
            active={pathname === "/dashboard"}
            onClick={() => {
              router.push("/dashboard");
              setIsMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={<FiStar className="h-5 w-5" />}
            label="Favorites"
            collapsed={collapsed}
            active={pathname === "/dashboard/favorites"}
            onClick={() => {
              router.push("/dashboard/favorites");
              setIsMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={<FiUsers className="h-5 w-5" />}
            label="Groups"
            collapsed={collapsed}
            active={pathname?.startsWith("/dashboard/groups")}
            onClick={() => {
              router.push("/dashboard/groups");
              setIsMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={<FiTrash2 className="h-5 w-5" />}
            label="Archive"
            collapsed={collapsed}
            active={pathname === "/dashboard/archive"}
            onClick={() => {
              router.push("/dashboard/archive");
              setIsMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={<FiHelpCircle className="h-5 w-5" />}
            label="Help"
            collapsed={collapsed}
            active={pathname === "/dashboard/help"}
            onClick={() => {
              router.push("/dashboard/help");
              setIsMobileMenuOpen(false);
            }}
          />

          {/* Folders Section */}
          {!collapsed && (
            <>
              <div className="mb-2 mt-6 flex items-center justify-between px-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Folders
                </span>
                <button
                  onClick={() => setShowFolderModal(true)}
                  className="rounded-md p-1 text-slate-500 transition-all hover:bg-emerald-500/10 hover:text-emerald-400"
                  title="New Folder"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>

              {folders.length === 0 ? (
                <div className="mx-3 rounded-lg border border-dashed border-white/10 bg-white/5 px-3 py-4 text-center">
                  <FiFolder className="mx-auto mb-1 h-5 w-5 text-slate-600" />
                  <p className="text-xs text-slate-500">No folders yet</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => {
                        router.push(`/dashboard/folder/${folder.id}`);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`group/folder flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        pathname === `/dashboard/folder/${folder.id}`
                          ? "bg-emerald-500/10 text-emerald-400 shadow-sm"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${getColorClass(
                          folder.color
                        )} ${pathname === `/dashboard/folder/${folder.id}` ? "shadow-emerald-500/50" : ""}`}
                      />
                      <span className="flex-1 truncate text-left">{folder.name}</span>
                      {folder.snippet_count! > 0 && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-slate-500 group-hover/folder:bg-white/15 group-hover/folder:text-slate-400">
                          {folder.snippet_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
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
          <div className="flex items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="text-base font-semibold text-slate-100 md:text-lg">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <NotificationsDropdown />
              <ThemeSelector />
              <UserMenu onOpenProfileCard={() => setShowProfileCard(true)} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">{children}</div>
        </div>
      </main>

      {/* User Profile Card */}
      <UserProfileCard
        isOpen={showProfileCard}
        onClose={() => setShowProfileCard(false)}
        onEditProfile={() => setShowProfileModal(true)}
      />

      {/* Profile Settings Modal */}
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
      className={`group/item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        active
          ? "bg-emerald-500/10 text-emerald-400 shadow-sm"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : ""}
    >
      <span className={`shrink-0 transition-transform group-hover/item:scale-110 ${active ? "text-emerald-400" : ""}`}>
        {icon}
      </span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
}

function UserMenu({ onOpenProfileCard }: { onOpenProfileCard: () => void }) {
  const [profile, setProfile] = useState<{
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);

      // Fetch profile
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, display_name, avatar_url")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }
      }
    };
    getUser();
  }, []);

  const getDisplayName = () => {
    if (profile?.display_name) return profile.display_name;
    if (profile?.username) return profile.username;
    return userEmail || "User";
  };

  const getInitials = () => {
    const name = getDisplayName();
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <button
      onClick={onOpenProfileCard}
      className="group relative flex items-center gap-2 rounded-lg px-2 py-2 transition-all hover:bg-white/5"
      title="View Profile"
    >
      {/* Avatar */}
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-transparent transition-all group-hover:ring-emerald-500/30">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm font-semibold text-white">
            {getInitials()}
          </span>
        )}
      </div>
    </button>
  );
}

