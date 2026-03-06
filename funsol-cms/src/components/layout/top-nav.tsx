"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { signOut } from "next-auth/react";

export function TopNav() {
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, sidebarOpen, setSidebarOpen, unreadCount } = useAppStore();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[60px] items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
      {/* Left: Logo + Menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-sm">
            F
          </div>
          <span className="hidden text-lg font-bold text-gray-900 dark:text-white font-heading sm:block">
            Funsol CMS
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => router.push("/dashboard")}
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Avatar src={user?.avatarData} name={user?.username || "U"} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-elevation-3 dark:border-gray-700 dark:bg-gray-800 animate-fade-in">
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email || user?.role}</p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <User className="h-4 w-4" />
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
