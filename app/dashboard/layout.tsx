// app/dashboard/layout.tsx
"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { VaultProvider, useVault } from "@/contexts/VaultContext";
import ProfileModal from "@/components/ProfileModal";
import UserProfileCard from "@/components/UserProfileCard";
import AddFolderModal from "@/components/AddFolderModal";
import ThemeSelector from "@/components/ThemeSelector";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import Avatar from "@/components/Avatar";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCode,
  FiStar,
  FiFolder,
  FiPlus,
  FiTrash2,
  FiHelpCircle,
  FiMenu,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

const FOLDER_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <VaultProvider>
        <DashboardShell>{children}</DashboardShell>
      </VaultProvider>
    </ThemeProvider>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<"profile" | "preferences" | "api-keys">("profile");
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { folders, counts, syncStatus, refreshAll } = useVault();

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isMobileMenuOpen]);

  const pageTitle = useMemo(() => {
    if (pathname === "/dashboard") return "All Snippets";
    if (pathname === "/dashboard/favorites") return "Favorites";
    if (pathname === "/dashboard/archive") return "Archive";
    if (pathname === "/dashboard/new") return "New Snippet";
    if (pathname === "/dashboard/help") return "Help & Guides";
    if (pathname.startsWith("/dashboard/folder/")) {
      const folderId = pathname.replace("/dashboard/folder/", "");
      const matched = folders.find((f) => f.id === folderId);
      return matched ? matched.name : "Folder";
    }
    if (pathname.endsWith("/edit")) return "Edit Snippet";
    if (pathname.startsWith("/dashboard/snippet/")) return "Snippet";
    return "Dashboard";
  }, [folders, pathname]);

  const openProfileSettings = (tab: "profile" | "preferences" | "api-keys" = "profile") => {
    setProfileInitialTab(tab);
    setShowProfileModal(true);
  };

  return (
    <div className="flex min-h-dvh bg-[#050608] text-slate-50">
      {/* Mobile backdrop overlay */}
      {isMobileMenuOpen && (
        <div
          className="cp-backdrop-in fixed inset-0 z-40 bg-black/70 backdrop-blur-[3px] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Dashboard navigation"
        className={`group fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#090B0E] transition-[width,transform] duration-200 ease-out md:relative ${
          collapsed ? "md:w-[72px]" : "md:w-64"
        } ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-64`}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close navigation menu"
          className="absolute right-3 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Desktop sidebar collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-white/[0.14] bg-[#0D1015] text-slate-400 shadow-lg transition-all hover:border-emerald-500/40 hover:text-emerald-400 md:flex"
        >
          {collapsed ? (
            <FiChevronRight className="h-3.5 w-3.5" />
          ) : (
            <FiChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-4">
          <Image
            src="/Glossy Green Code Pocket Icon.png"
            alt="CodePocket"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 object-contain"
          />
          {!collapsed && (
            <div className="min-w-0 flex flex-col">
              <span className="truncate font-[family-name:var(--font-bricolage)] text-base font-bold tracking-tight text-slate-100">
                CodePocket
              </span>
              <span className="text-[11px] text-slate-400">Snippet Vault</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <SidebarItem
            icon={<FiCode className="h-4 w-4" />}
            label="All Snippets"
            count={counts.all}
            collapsed={collapsed}
            active={pathname === "/dashboard"}
            onClick={() => {
              router.push("/dashboard");
              setIsMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={<FiStar className="h-4 w-4" />}
            label="Favorites"
            count={counts.favorites}
            collapsed={collapsed}
            active={pathname === "/dashboard/favorites"}
            onClick={() => {
              router.push("/dashboard/favorites");
              setIsMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={<FiTrash2 className="h-4 w-4" />}
            label="Archive"
            count={counts.archive}
            collapsed={collapsed}
            active={pathname === "/dashboard/archive"}
            onClick={() => {
              router.push("/dashboard/archive");
              setIsMobileMenuOpen(false);
            }}
          />
          <SidebarItem
            icon={<FiHelpCircle className="h-4 w-4" />}
            label="Help"
            collapsed={collapsed}
            active={pathname === "/dashboard/help"}
            onClick={() => {
              router.push("/dashboard/help");
              setIsMobileMenuOpen(false);
            }}
          />

          {/* Folders */}
          {!collapsed && (
            <div className="pt-5">
              <div className="mb-2 flex items-center justify-between px-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Folders
                </span>
                <button
                  type="button"
                  onClick={() => setShowFolderModal(true)}
                  aria-label="Create new folder"
                  title="New Folder"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-emerald-500/15 hover:text-emerald-400"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>

              {folders.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowFolderModal(true)}
                  className="flex w-full flex-col items-center rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] px-3 py-4 text-center transition-colors hover:border-emerald-500/35 hover:bg-emerald-500/[0.04]"
                >
                  <FiFolder className="mb-1.5 h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">
                    Create a folder
                  </span>
                </button>
              ) : (
                <div className="space-y-0.5">
                  {folders.map((folder) => {
                    const isActive = pathname === `/dashboard/folder/${folder.id}`;
                    return (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => {
                          router.push(`/dashboard/folder/${folder.id}`);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex min-h-[40px] w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-emerald-500/12 text-emerald-300"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            FOLDER_COLORS[folder.color] || FOLDER_COLORS.emerald
                          }`}
                        />
                        <span className="flex-1 truncate text-left">{folder.name}</span>
                        {folder.snippet_count > 0 && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] ${
                              isActive
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-white/[0.06] text-slate-400"
                            }`}
                          >
                            {folder.snippet_count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {collapsed && (
            <SidebarItem
              icon={<FiFolder className="h-4 w-4" />}
              label="Folders"
              collapsed={collapsed}
              onClick={() => setCollapsed(false)}
            />
          )}
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#050608]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#050608]/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0D1015] text-slate-300 transition-colors hover:border-white/20 hover:text-white md:hidden"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="truncate text-base font-semibold text-slate-100 md:text-lg">
                {pageTitle}
              </h1>

              {/* Live Realtime Sync Indicator */}
              <button
                type="button"
                onClick={() => void refreshAll({ silent: true })}
                title="Live vault sync active — click to sync now"
                className="hidden items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#0D1015] px-2 py-1 font-mono text-[11px] text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200 sm:inline-flex"
              >
                {syncStatus === "syncing" ? (
                  <FiRefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                ) : (
                  <span
                    className={`h-2 w-2 rounded-full ${
                      syncStatus === "live" ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                )}
                <span>
                  {syncStatus === "live"
                    ? "Live"
                    : syncStatus === "syncing"
                      ? "Syncing"
                      : "Offline"}
                </span>
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <NotificationsDropdown />
              <ThemeSelector />
              <UserMenu onOpenProfileCard={() => setShowProfileCard(true)} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-7">
            {children}
          </div>
        </div>
      </main>

      {/* Modals */}
      <UserProfileCard
        isOpen={showProfileCard}
        onClose={() => setShowProfileCard(false)}
        onEditProfile={() => openProfileSettings("profile")}
        onOpenPreferences={() => openProfileSettings("preferences")}
        onOpenApiKeys={() => openProfileSettings("api-keys")}
      />

      <ProfileModal
        isOpen={showProfileModal}
        initialTab={profileInitialTab}
        onClose={() => setShowProfileModal(false)}
      />

      <AddFolderModal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
      />
    </div>
  );
}

type SidebarItemProps = {
  icon: ReactNode;
  label: string;
  count?: number;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
};

function SidebarItem({
  icon,
  label,
  count,
  collapsed,
  active,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/item flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-emerald-500/12 text-emerald-300"
          : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : undefined}
    >
      <span className={`shrink-0 ${active ? "text-emerald-400" : ""}`}>{icon}</span>
      {!collapsed && <span className="flex-1 truncate text-left">{label}</span>}
      {!collapsed && typeof count === "number" && count > 0 && (
        <span
          className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] ${
            active
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-white/[0.06] text-slate-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function UserMenu({ onOpenProfileCard }: { onOpenProfileCard: () => void }) {
  const { user, profile } = useVault();

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <button
      type="button"
      onClick={onOpenProfileCard}
      aria-label="Open profile menu"
      title="View Profile & Settings"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-[#0D1015] transition-colors hover:border-emerald-500/40"
    >
      <Avatar
        src={profile?.avatar_url}
        alt={displayName}
        fallbackText={displayName}
        size="sm"
        className="h-8 w-8"
      />
    </button>
  );
}
