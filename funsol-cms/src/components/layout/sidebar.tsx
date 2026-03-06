"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  HardDrive,
  BarChart3,
  CheckSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/accounts", label: "Accounts", icon: Building2 },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/drive", label: "Drive", icon: HardDrive },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, sidebarOpen, setSidebarOpen } = useAppStore();
  const user = useAppStore((s) => s.user);

  const isAdmin = user?.role === "Admin" || user?.username === "admin";
  const isManager = user?.role === "Manager" || user?.role === "Super Manager" || isAdmin;

  // Filter nav items based on role
  const visibleItems = navItems.filter((item) => {
    if (item.href === "/users" && !isManager) return false;
    if (item.href === "/settings" && !isAdmin) return false;
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-[60px] z-40 flex h-[calc(100vh-60px)] flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900",
          sidebarCollapsed ? "w-[60px]" : "w-[280px]",
          "max-lg:translate-x-0",
          !sidebarOpen && "max-lg:-translate-x-full"
        )}
      >
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-100 text-primary-500 dark:bg-primary-900 dark:text-primary-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden border-t border-gray-200 p-3 text-gray-400 hover:text-gray-600 dark:border-gray-700 dark:hover:text-gray-300 lg:flex items-center justify-center"
        >
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </aside>
    </>
  );
}
