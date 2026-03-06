import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function parseCSV(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toCSV(arr: string[]): string {
  return arr.filter(Boolean).join(",");
}

export function getInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    Admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    "Super Manager": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    Manager: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Supervisor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    User: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };
  return colors[role] || colors.User;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "in-progress": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    declined: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    completed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  };
  return colors[status] || colors.open;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return colors[priority] || colors.low;
}
