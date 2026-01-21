"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiActivity, FiSettings, FiUsers } from "react-icons/fi";

const navItems = [
  {
    name: "Logs",
    href: "/adminoreo/logs",
    icon: FiActivity,
  },
  {
    name: "Users",
    href: "/adminoreo/users",
    icon: FiUsers,
  },
  {
    name: "Settings",
    href: "/adminoreo/settings",
    icon: FiSettings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/10 bg-slate-900 p-6">
      {/* Logo */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
        <p className="text-sm text-slate-400">CodePocket</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Admin Access</p>
          <p className="text-sm font-medium text-white">Authenticated</p>
        </div>
      </div>
    </aside>
  );
}
