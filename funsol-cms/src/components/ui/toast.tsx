"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null;

export function toast(type: ToastType, message: string) {
  addToastFn?.(type, message);
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
  error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20",
  info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (type: ToastType, message: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-elevation-3 animate-slide-up min-w-[300px] max-w-[420px]",
            bgColors[t.type]
          )}
        >
          {icons[t.type]}
          <p className="flex-1 text-sm text-gray-800 dark:text-gray-200">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
