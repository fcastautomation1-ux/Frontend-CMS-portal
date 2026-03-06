import { create } from "zustand";
import type { SessionUser, Account, Todo, Notification, LookerReport, Workflow } from "@/types";

interface AppState {
  // User
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;

  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Accounts
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;

  // Todos
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;

  // Reports
  reports: LookerReport[];
  setReports: (reports: LookerReport[]) => void;

  // Workflows
  workflows: Workflow[];
  setWorkflows: (workflows: Workflow[]) => void;

  // Loading
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  sidebarOpen: true,
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  accounts: [],
  setAccounts: (accounts) => set({ accounts }),

  todos: [],
  setTodos: (todos) => set({ todos }),

  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),

  reports: [],
  setReports: (reports) => set({ reports }),

  workflows: [],
  setWorkflows: (workflows) => set({ workflows }),

  loading: false,
  setLoading: (loading) => set({ loading }),
}));
