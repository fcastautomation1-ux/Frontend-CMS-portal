"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/store";
import { supabase } from "@/lib/supabase";

const POLL_INTERVAL = 30_000; // 30 seconds

export function useNotifications() {
  const user = useAppStore((s) => s.user);
  const setNotifications = useAppStore((s) => s.setNotifications);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.username) return;
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("username", user.username)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data);
      }
    } catch {
      // Silently fail for polling
    }
  }, [user?.username, setNotifications]);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    if (!user?.username) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("username", user.username)
      .eq("read", false);
    fetchNotifications();
  }, [user?.username, fetchNotifications]);

  const showDesktopNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification(title, { body, icon: "/favicon.ico" });
  }, []);

  return { fetchNotifications, markAsRead, markAllRead, showDesktopNotification };
}
