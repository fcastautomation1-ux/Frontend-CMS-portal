"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TopNav } from "./top-nav";
import { Sidebar } from "./sidebar";
import { ToastContainer } from "@/components/ui/toast";
import { useAppStore } from "@/store";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setUser, sidebarCollapsed } = useAppStore();
  useNotifications();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user) {
      setUser(session.user as any);
    }
  }, [session, status, router, setUser]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading Funsol CMS...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav />
      <Sidebar />
      <main
        className={cn(
          "pt-[60px] transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[60px]" : "lg:pl-[280px]"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
      <ToastContainer />
    </div>
  );
}
