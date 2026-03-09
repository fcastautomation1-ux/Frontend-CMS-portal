"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CornerDownRight,
  Download,
  Filter,
  ListFilter,
  Kanban,
  ListTodo,
  MessageSquare,
  Plus,
  Send,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

type AppUser = {
  username: string;
  role: string;
  department: string | null;
  manager_id: string | null;
  team_members: string | null;
};

type Todo = {
  id: string;
  title: string;
  description: string | null;
  our_goal: string | null;
  notes: string | null;
  username: string;
  assigned_to: string | null;
  manager_id: string | null;
  task_status: "backlog" | "todo" | "in_progress" | "done" | null;
  approval_status: "approved" | "pending_approval" | "declined" | null;
  status: "open" | "in-progress" | "pending" | "approved" | "declined" | "completed" | null;
  priority: "urgent" | "high" | "medium" | "low" | null;
  due_date: string | null;
  completed: boolean | null;
  completed_by: string | null;
  category: string | null;
  kpi_type: string | null;
  app_name: string | null;
  package_name: string | null;
  archived: boolean | null;
  queue_department: string | null;
  queue_status: "queued" | "claimed" | "completed" | null;
  decline_reason?: string | null;
  assignment_chain?: string | AssignmentChainEntry[] | null;
  history?: string | TaskHistoryEntry[] | null;
  attachments?: string | null;
  created_at: string;
  updated_at: string | null;
};

type AssignmentChainEntry = {
  username: string;
  role?: string;
  status?: string;
  message?: string;
  timestamp?: string;
};

type TaskHistoryEntry = {
  user: string;
  details: string;
  timestamp: string;
};

type TodoShare = {
  todo_id: string;
  shared_with: string;
};

type QuickFilter =
  | "my_pending"
  | "my_all"
  | "team_pending"
  | "team_all"
  | "all_pending"
  | "all"
  | "approval_pending"
  | "approval_all"
  | "my_approval_pending"
  | "other_approval_pending";

type ViewMode = "list" | "kanban" | "calendar";
type ModulePanel = "workboard" | "queue" | "approval";

type SmartList =
  | "all"
  | "today"
  | "upcoming"
  | "overdue"
  | "thisweek"
  | "thismonth"
  | "my_approval_pending"
  | "other_approval_pending"
  | "unassigned"
  | "queued"
  | "created_by_me";

type TaskForm = {
  title: string;
  description: string;
  our_goal: string;
  notes: string;
  priority: "urgent" | "high" | "medium" | "low";
  due_date: string;
  app_name: string;
  package_name: string;
  kpi_type: string;
  route_mode: "self" | "department" | "manager" | "multi";
  assigned_to: string;
  assignees_csv: string;
  queue_department: string;
};

type TaskTemplate = {
  id: string;
  name: string;
  form: TaskForm;
};

const FORM_DRAFT_KEY = "legacy_tasks_form_draft_v2";
type TaskMetadata = {
  appNames: string[];
  packageNames: string[];
  kpiTypes: string[];
  priorities: string[];
  statuses: string[];
  appPackagePairs: Array<{ app_name: string; package_name: string }>;
  quickFilters: Array<{ value: string; label: string }>;
  smartLists: Array<{ value: string; label: string }>;
  dateFilters: Array<{ value: string; label: string }>;
  messageFilters: Array<{ value: string; label: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  routingModes: Array<{ value: string; label: string }>;
};

function parseCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAdminLike(user: AppUser | null): boolean {
  if (!user) return false;
  return user.username === "admin" || user.role === "Admin" || user.role === "Super Manager";
}

function isManager(user: AppUser | null): boolean {
  return !!user && user.role === "Manager";
}

function isDone(task: Todo): boolean {
  return (
    task.completed === true ||
    task.task_status === "done" ||
    task.approval_status === "approved" ||
    task.status === "completed"
  );
}

function isPending(task: Todo): boolean {
  return !isDone(task) && (task.approval_status === "pending_approval" || task.status === "pending");
}

function toInputDateTime(value: string | null): string {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function parseJsonArray<T>(value: string | T[] | null | undefined): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeOptions(input: unknown): Array<{ value: string; label: string }> {
  if (!Array.isArray(input)) return [];
  const mapped = input
    .map((item) => {
      if (typeof item === "string") {
        return { value: item, label: titleCase(item) };
      }
      if (item && typeof item === "object") {
        const raw = item as Record<string, unknown>;
        const value = String(raw.value || "").trim();
        const label = String(raw.label || "").trim();
        if (!value) return null;
        return { value, label: label || titleCase(value) };
      }
      return null;
    })
    .filter(Boolean) as Array<{ value: string; label: string }>;

  const dedup = new Map<string, { value: string; label: string }>();
  mapped.forEach((m) => {
    if (!dedup.has(m.value)) dedup.set(m.value, m);
  });
  return Array.from(dedup.values());
}

const ROUTE_META: Record<TaskForm["route_mode"], { emoji: string; title: string; subtitle: string }> = {
  self: {
    emoji: "📝",
    title: "Self Todo",
    subtitle: "Create this task for yourself",
  },
  department: {
    emoji: "🏢",
    title: "Send to Department",
    subtitle: "Route to a department queue for auto-assignment",
  },
  manager: {
    emoji: "👤",
    title: "Send to Manager Directly",
    subtitle: "Assign directly to a team manager",
  },
  multi: {
    emoji: "👥",
    title: "Multi-Assignment",
    subtitle: "Send this task to multiple users at once",
  },
};

export default function TasksPage() {
  const { data: session } = useSession();
  const me = (session?.user as { username?: string } | undefined)?.username || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [sharedTaskIds, setSharedTaskIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("my_pending");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [messageFilter, setMessageFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [panel, setPanel] = useState<ModulePanel>("workboard");
  const [smartList, setSmartList] = useState<SmartList>("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [form, setForm] = useState<TaskForm>({
    title: "",
    description: "",
    our_goal: "",
    notes: "",
    priority: "medium",
    due_date: "",
    app_name: "",
    package_name: "",
    kpi_type: "",
    route_mode: "self",
    assigned_to: "",
    assignees_csv: "",
    queue_department: "",
  });

  const [detailTask, setDetailTask] = useState<Todo | null>(null);
  const [shareTask, setShareTask] = useState<Todo | null>(null);
  const [shareTarget, setShareTarget] = useState("");
  const [declineTask, setDeclineTask] = useState<Todo | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [delegateTask, setDelegateTask] = useState<Todo | null>(null);
  const [delegateTarget, setDelegateTarget] = useState("");
  const [detailComment, setDetailComment] = useState("");
  const [bulkShareOpen, setBulkShareOpen] = useState(false);
  const [bulkShareUsers, setBulkShareUsers] = useState<string[]>([]);
  const [updateDueTask, setUpdateDueTask] = useState<Todo | null>(null);
  const [updatedDueDate, setUpdatedDueDate] = useState("");
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [creationFiles, setCreationFiles] = useState<File[]>([]);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineDueDate, setInlineDueDate] = useState("");
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TaskMetadata>({
    appNames: [],
    packageNames: [],
    kpiTypes: [],
    priorities: [],
    statuses: [],
    appPackagePairs: [],
    quickFilters: [],
    smartLists: [],
    dateFilters: [],
    messageFilters: [],
    sortOptions: [],
    routingModes: [],
  });
  const ourGoalRef = useRef<HTMLDivElement>(null);

  const lowerMe = me.toLowerCase();

  useEffect(() => {
    async function load() {
      if (!me) {
        setLoading(false);
        return;
      }

      try {
        const [userRes, usersRes, todoRes, shareRes, metaRes] = await Promise.all([
          fetch(`/api/users?username=${encodeURIComponent(me)}`, { cache: "no-store" }),
          fetch("/api/users", { cache: "no-store" }),
          fetch("/api/todos", { cache: "no-store" }),
          fetch(`/api/todos/shares?shared_with=${encodeURIComponent(me)}`, { cache: "no-store" }),
          fetch("/api/todos/metadata", { cache: "no-store" }),
        ]);

        if (!userRes.ok || !usersRes.ok || !todoRes.ok || !shareRes.ok || !metaRes.ok) {
          throw new Error("Failed to load data");
        }

        const userJson = await userRes.json();
        const usersJson = await usersRes.json();
        const todoJson = await todoRes.json();
        const shareJson = await shareRes.json();
          const metaJson = await metaRes.json();

        const meRow = Array.isArray(userJson) ? userJson[0] : userJson;
        const allUsers = Array.isArray(usersJson) ? usersJson : [];
        const allTasks = Array.isArray(todoJson) ? (todoJson as Todo[]) : [];
        const shares = Array.isArray(shareJson) ? (shareJson as TodoShare[]) : [];

        const meNormalized: AppUser | null = meRow
          ? {
              username: meRow.username,
              role: meRow.role,
              department: meRow.department || null,
              manager_id: meRow.manager_id || null,
              team_members: meRow.team_members || null,
            }
          : null;

        const normalizedUsers: AppUser[] = allUsers.map((u: any) => ({
          username: u.username,
          role: u.role,
          department: u.department || null,
          manager_id: u.manager_id || null,
          team_members: u.team_members || null,
        }));

        setCurrentUser(meNormalized);
        setUsers(normalizedUsers);
        setTasks(allTasks);
        setSharedTaskIds(new Set(shares.map((s) => s.todo_id)));
        setMetadata({
          appNames: Array.isArray(metaJson.appNames) ? metaJson.appNames : [],
          packageNames: Array.isArray(metaJson.packageNames) ? metaJson.packageNames : [],
          kpiTypes: Array.isArray(metaJson.kpiTypes) ? metaJson.kpiTypes : [],
          priorities: Array.isArray(metaJson.priorities) ? metaJson.priorities : [],
          statuses: Array.isArray(metaJson.statuses) ? metaJson.statuses : [],
          appPackagePairs: Array.isArray(metaJson.appPackagePairs) ? metaJson.appPackagePairs : [],
          quickFilters: normalizeOptions(metaJson.quickFilters),
          smartLists: normalizeOptions(metaJson.smartLists),
          dateFilters: normalizeOptions(metaJson.dateFilters),
          messageFilters: normalizeOptions(metaJson.messageFilters),
          sortOptions: normalizeOptions(metaJson.sortOptions),
          routingModes: normalizeOptions(metaJson.routingModes),
        });

        const templateRes = await fetch(`/api/todos/templates?username=${encodeURIComponent(me)}`, { cache: "no-store" });
        if (templateRes.ok) {
          const templateJson = await templateRes.json();
          setTemplates(Array.isArray(templateJson) ? templateJson : []);
        }

        if (meNormalized) {
          if (isAdminLike(meNormalized)) {
            setQuickFilter("all");
          } else if (isManager(meNormalized)) {
            setQuickFilter("team_pending");
          } else {
            setQuickFilter("my_pending");
          }

          const draftRaw = localStorage.getItem(FORM_DRAFT_KEY);
          if (draftRaw) {
            try {
              const draft = JSON.parse(draftRaw) as Partial<TaskForm>;
              setForm((prev) => ({ ...prev, ...draft }));
            } catch {
              // Ignore invalid draft JSON
            }
          }
        }
      } catch {
        alert("Could not load tasks module data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [me]);

  const managerTeam = useMemo(() => {
    if (!currentUser) return new Set<string>();
    const team = new Set<string>(parseCsv(currentUser.team_members).map((u) => u.toLowerCase()));
    const meLower = currentUser.username.toLowerCase();

    users.forEach((u) => {
      if (parseCsv(u.manager_id).some((m) => m.toLowerCase() === meLower)) {
        team.add(u.username.toLowerCase());
      }
    });

    return team;
  }, [currentUser, users]);

  const visibleTasks = useMemo(() => {
    if (!currentUser) return [];

    const isAdmin = isAdminLike(currentUser);
    const canManagerSee = isManager(currentUser);

    return tasks.filter((task) => {
      if (task.archived) return false;
      if (isAdmin) return true;

      const owner = (task.username || "").toLowerCase();
      const assignee = (task.assigned_to || "").toLowerCase();

      if (owner === lowerMe || assignee === lowerMe) return true;
      if (sharedTaskIds.has(task.id)) return true;

      if (canManagerSee && (managerTeam.has(owner) || managerTeam.has(assignee))) return true;
      if (canManagerSee && parseCsv(task.manager_id).some((m) => m.toLowerCase() === lowerMe)) return true;

      return false;
    });
  }, [tasks, currentUser, lowerMe, managerTeam, sharedTaskIds]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const scoped = visibleTasks.filter((task) => {
      const owner = (task.username || "").toLowerCase();
      const assignee = (task.assigned_to || "").toLowerCase();
      const isMine = owner === lowerMe || assignee === lowerMe;
      const isTeamTask = managerTeam.has(owner) || managerTeam.has(assignee);
      const pendingApproval = isPending(task);

      if (quickFilter === "my_pending" && (!isMine || isDone(task))) return false;
      if (quickFilter === "my_all" && !isMine) return false;
      if (quickFilter === "team_pending" && (!isTeamTask || isDone(task))) return false;
      if (quickFilter === "team_all" && !isTeamTask) return false;
      if (quickFilter === "all_pending" && isDone(task)) return false;
      if (quickFilter === "approval_pending" && !pendingApproval) return false;
      if (quickFilter === "approval_all" && !(task.approval_status || "").includes("approval")) return false;
      if (quickFilter === "my_approval_pending" && !((task.username || "").toLowerCase() === lowerMe && pendingApproval)) return false;
      if (quickFilter === "other_approval_pending" && !((task.username || "").toLowerCase() !== lowerMe && pendingApproval)) return false;

      if (statusFilter !== "all") {
        let matchedKnown = false;
        if (statusFilter === "pending" && isDone(task)) return false;
        if (statusFilter === "queue" && !(task.queue_status === "queued" || !!task.queue_department)) return false;
        if (statusFilter === "inprogress" && !((task.task_status || "") === "in_progress" || (task.status || "") === "in-progress")) return false;
        if (statusFilter === "completed" && !isDone(task)) return false;
        if (statusFilter === "overdue") {
          if (!task.due_date || !(new Date(task.due_date) < todayStart && !isDone(task))) return false;
        }
        if (statusFilter === "archived" && !task.archived) return false;
        if (["pending", "queue", "inprogress", "completed", "overdue", "archived"].includes(statusFilter)) {
          matchedKnown = true;
        }
        if (!matchedKnown) {
          const rawStatus = (task.status || "").toLowerCase();
          const rawTaskStatus = (task.task_status || "").toLowerCase();
          const selected = statusFilter.toLowerCase();
          if (!(rawStatus === selected || rawTaskStatus === selected)) return false;
        }
      }

      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

      if (assigneeFilter !== "all") {
        const selected = assigneeFilter.toLowerCase();
        if (((task.assigned_to || "").toLowerCase() !== selected) && ((task.username || "").toLowerCase() !== selected)) {
          return false;
        }
      }

      if (departmentFilter !== "all") {
        if ((task.queue_department || "").toLowerCase() !== departmentFilter.toLowerCase()) {
          return false;
        }
      }

      if (dateFilter !== "all") {
        const due = task.due_date ? new Date(task.due_date) : null;
        if (!due || Number.isNaN(due.getTime())) return false;

        if (dateFilter === "today" && (due < todayStart || due > todayEnd)) return false;
        if (dateFilter === "yesterday") {
          const y = new Date(now);
          y.setDate(now.getDate() - 1);
          if (due < startOfDay(y) || due > endOfDay(y)) return false;
        }
        if (dateFilter === "last7days") {
          const last7 = new Date(now);
          last7.setDate(now.getDate() - 7);
          if (!(due >= startOfDay(last7) && due <= todayEnd)) return false;
        }
        if (dateFilter === "last30days") {
          const last30 = new Date(now);
          last30.setDate(now.getDate() - 30);
          if (!(due >= startOfDay(last30) && due <= todayEnd)) return false;
        }
        if (dateFilter === "thisweek") {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          if (!(due >= startOfDay(weekStart) && due <= endOfDay(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6)))) return false;
        }
        if (dateFilter === "lastweek") {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay() - 7);
          const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
          if (!(due >= startOfDay(weekStart) && due <= endOfDay(weekEnd))) return false;
        }
        if (dateFilter === "thismonth") {
          if (due.getMonth() !== now.getMonth() || due.getFullYear() !== now.getFullYear()) return false;
        }
        if (dateFilter === "lastmonth") {
          const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          if (due.getMonth() !== lm.getMonth() || due.getFullYear() !== lm.getFullYear()) return false;
        }
        if (dateFilter === "thisyear") {
          if (due.getFullYear() !== now.getFullYear()) return false;
        }
        if (dateFilter === "overdue" && !(due < todayStart && !isDone(task))) return false;
        if (dateFilter === "next7") {
          const next7 = new Date(now);
          next7.setDate(now.getDate() + 7);
          if (!(due >= todayStart && due <= endOfDay(next7))) return false;
        }
        if (dateFilter === "custom") {
          if (!customDateFrom || !customDateTo) return false;
          const from = startOfDay(new Date(customDateFrom));
          const to = endOfDay(new Date(customDateTo));
          if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return false;
          if (!(due >= from && due <= to)) return false;
        }
      }

      if (messageFilter === "unread") {
        const notes = (task.notes || "").toLowerCase();
        if (!notes.includes("[unread]") && !notes.includes("unread")) return false;
      }
      if (messageFilter === "read") {
        const notes = (task.notes || "").toLowerCase();
        if (!notes || notes.includes("[unread]")) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const text = [
          task.title,
          task.description || "",
          task.our_goal || "",
          task.notes || "",
          task.assigned_to || "",
          task.username || "",
          task.app_name || "",
          task.package_name || "",
        ]
          .join(" ")
          .toLowerCase();

        if (!text.includes(q)) return false;
      }

      if (smartList !== "all") {
        if (smartList === "overdue") {
          if (!task.due_date || !(new Date(task.due_date) < todayStart && !isDone(task))) return false;
        }
        if (smartList === "today") {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          if (due < todayStart || due > todayEnd) return false;
        }
        if (smartList === "upcoming") {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          const next7 = new Date(now);
          next7.setDate(now.getDate() + 7);
          if (!(due >= todayStart && due <= endOfDay(next7))) return false;
        }
        if (smartList === "thisweek") {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
          if (!(due >= startOfDay(weekStart) && due <= endOfDay(weekEnd))) return false;
        }
        if (smartList === "thismonth") {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          if (due.getMonth() !== now.getMonth() || due.getFullYear() !== now.getFullYear()) return false;
        }
        if (smartList === "my_approval_pending") {
          if (!((task.username || "").toLowerCase() === lowerMe && isPending(task))) return false;
        }
        if (smartList === "other_approval_pending") {
          if (!((task.username || "").toLowerCase() !== lowerMe && isPending(task))) return false;
        }
        if (smartList === "unassigned" && !!task.assigned_to) return false;
        if (smartList === "queued" && !(task.queue_status === "queued" || !!task.queue_department)) return false;
        if (smartList === "created_by_me" && (task.username || "").toLowerCase() !== lowerMe) return false;
      }

      return true;
    });

    const sorted = [...scoped];
    sorted.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "due_soon") {
        const da = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        const db = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
        return da - db;
      }
      if (sortBy === "priority") {
        const rank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
        const pa = rank[(a.priority || "medium") as keyof typeof rank] ?? 2;
        const pb = rank[(b.priority || "medium") as keyof typeof rank] ?? 2;
        return pa - pb;
      }
      return 0;
    });

    return sorted;
  }, [visibleTasks, quickFilter, statusFilter, priorityFilter, dateFilter, assigneeFilter, departmentFilter, search, smartList, sortBy, lowerMe, managerTeam, customDateFrom, customDateTo, messageFilter]);

  const quickFilterCounts = useMemo(() => {
    const mine = visibleTasks.filter((task) => {
      const owner = (task.username || "").toLowerCase();
      const assignee = (task.assigned_to || "").toLowerCase();
      return owner === lowerMe || assignee === lowerMe;
    });
    const team = visibleTasks.filter((task) => {
      const owner = (task.username || "").toLowerCase();
      const assignee = (task.assigned_to || "").toLowerCase();
      return managerTeam.has(owner) || managerTeam.has(assignee);
    });

    return {
      my_pending: mine.filter((t) => !isDone(t)).length,
      my_all: mine.length,
      team_pending: team.filter((t) => !isDone(t)).length,
      team_all: team.length,
      all_pending: visibleTasks.filter((t) => !isDone(t)).length,
      all: visibleTasks.length,
      approval_pending: visibleTasks.filter((t) => isPending(t)).length,
      approval_all: visibleTasks.filter((t) => (t.approval_status || "") !== "approved").length,
      my_approval_pending: visibleTasks.filter((t) => (t.username || "").toLowerCase() === lowerMe && isPending(t)).length,
      other_approval_pending: visibleTasks.filter((t) => (t.username || "").toLowerCase() !== lowerMe && isPending(t)).length,
    };
  }, [visibleTasks, lowerMe, managerTeam]);

  const kpis = useMemo(() => {
    const total = visibleTasks.length;
    const mine = visibleTasks.filter((t) => (t.assigned_to || "").toLowerCase() === lowerMe).length;
    const complete = visibleTasks.filter((t) => isDone(t)).length;
    const pendingApproval = visibleTasks.filter((t) => isPending(t)).length;
    const inProgress = visibleTasks.filter((t) => t.task_status === "in_progress").length;
    const today = startOfDay(new Date());
    const overdue = visibleTasks.filter((t) => t.due_date && new Date(t.due_date) < today && !isDone(t)).length;

    return [
      { title: "Total Tasks", value: total, icon: <ListTodo className="h-5 w-5" /> },
      { title: "Assigned To Me", value: mine, icon: <UserCheck className="h-5 w-5" /> },
      { title: "Completed", value: complete, icon: <CheckCircle2 className="h-5 w-5" /> },
      { title: "In Progress", value: inProgress, icon: <Clock3 className="h-5 w-5" /> },
      { title: "Pending Approval", value: pendingApproval, icon: <Send className="h-5 w-5" /> },
      { title: "Overdue", value: overdue, icon: <XCircle className="h-5 w-5" /> },
    ];
  }, [visibleTasks, lowerMe]);

  const assigneeOptions = useMemo(() => {
    const set = new Set<string>();
    visibleTasks.forEach((t) => {
      if (t.assigned_to) set.add(t.assigned_to);
      if (t.username) set.add(t.username);
    });

    return [
      { value: "all", label: "All People" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((u) => ({ value: u, label: u })),
    ];
  }, [visibleTasks]);

  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.department) set.add(u.department);
    });

    return [
      { value: "all", label: "All Departments" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((d) => ({ value: d, label: d })),
    ];
  }, [users]);

  const managerOptions = useMemo(() => {
    return users
      .filter((u) => ["Manager", "Super Manager", "Admin"].includes(u.role))
      .map((u) => ({ value: u.username, label: `${u.username} (${u.role})` }));
  }, [users]);

  const appOptions = metadata.appNames;
  const packageOptions = metadata.packageNames;

  useEffect(() => {
    if (!taskModalOpen) return;
    localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(form));
  }, [form, taskModalOpen]);

  function resetForm() {
    setForm({
      title: "",
      description: "",
      our_goal: "",
      notes: "",
      priority: "medium",
      due_date: "",
      app_name: "",
      package_name: "",
      kpi_type: "",
      route_mode: "self",
      assigned_to: "",
      assignees_csv: "",
      queue_department: "",
    });
    localStorage.removeItem(FORM_DRAFT_KEY);
  }

  function openCreateModal() {
    setEditingTask(null);
    setCreationFiles([]);
    setTaskModalOpen(true);
  }

  function openEditModal(task: Todo) {
    setEditingTask(task);
    setForm({
      title: task.title || "",
      description: task.description || "",
      our_goal: task.our_goal || "",
      notes: task.notes || "",
      priority: task.priority || "medium",
      due_date: toInputDateTime(task.due_date),
      app_name: task.app_name || "",
      package_name: task.package_name || "",
      kpi_type: task.kpi_type || "",
      route_mode: task.queue_department ? "department" : "self",
      assigned_to: task.assigned_to || "",
      assignees_csv: "",
      queue_department: task.queue_department || "",
    });
    setEditingTask(task);
    setCreationFiles([]);
    setTaskModalOpen(true);
  }

  function syncAppToPackage(appName: string) {
    const matches = metadata.appPackagePairs.filter((pair) => pair.app_name === appName);
    const unique = Array.from(new Set(matches.map((m) => m.package_name)));
    setForm((p) => ({ ...p, app_name: appName, package_name: unique.length === 1 ? unique[0] : p.package_name }));
  }

  function syncPackageToApp(pkg: string) {
    const matches = metadata.appPackagePairs.filter((pair) => pair.package_name === pkg);
    const unique = Array.from(new Set(matches.map((m) => m.app_name)));
    setForm((p) => ({ ...p, package_name: pkg, app_name: unique.length === 1 ? unique[0] : p.app_name }));
  }

  function formatOurGoal(command: "bold" | "italic" | "underline" | "insertUnorderedList" | "insertOrderedList") {
    if (!ourGoalRef.current) return;
    ourGoalRef.current.focus();
    document.execCommand(command);
    setForm((p) => ({ ...p, our_goal: ourGoalRef.current?.innerHTML || "" }));
  }

  async function refreshTasks() {
    const [todoRes, shareRes, metaRes] = await Promise.all([
      fetch("/api/todos", { cache: "no-store" }),
      fetch(`/api/todos/shares?shared_with=${encodeURIComponent(me)}`, { cache: "no-store" }),
      fetch("/api/todos/metadata", { cache: "no-store" }),
    ]);

    const todoJson = await todoRes.json();
    const shareJson = await shareRes.json();
    const metaJson = await metaRes.json();

    setTasks(Array.isArray(todoJson) ? todoJson : []);
    setSharedTaskIds(new Set(Array.isArray(shareJson) ? shareJson.map((s: TodoShare) => s.todo_id) : []));
    setMetadata({
      appNames: Array.isArray(metaJson.appNames) ? metaJson.appNames : [],
      packageNames: Array.isArray(metaJson.packageNames) ? metaJson.packageNames : [],
      kpiTypes: Array.isArray(metaJson.kpiTypes) ? metaJson.kpiTypes : [],
      priorities: Array.isArray(metaJson.priorities) ? metaJson.priorities : [],
      statuses: Array.isArray(metaJson.statuses) ? metaJson.statuses : [],
      appPackagePairs: Array.isArray(metaJson.appPackagePairs) ? metaJson.appPackagePairs : [],
      quickFilters: normalizeOptions(metaJson.quickFilters),
      smartLists: normalizeOptions(metaJson.smartLists),
      dateFilters: normalizeOptions(metaJson.dateFilters),
      messageFilters: normalizeOptions(metaJson.messageFilters),
      sortOptions: normalizeOptions(metaJson.sortOptions),
      routingModes: normalizeOptions(metaJson.routingModes),
    });
  }

  async function submitTask() {
    const title = form.title.trim();
    const routeMode = form.route_mode;
    const isSelfTodo = routeMode === "self";

    if (!form.kpi_type.trim()) {
      alert("Please select KPI's.");
      return;
    }

    if (!title) {
      alert("Please enter a task title.");
      return;
    }

    if (title.length < 3 || title.length > 30) {
      alert("Title must be between 3 and 30 characters");
      return;
    }

    // Legacy behavior: due date is mandatory for non-self routing.
    if (!isSelfTodo && !form.due_date) {
      alert("Please set a due date for this task.");
      return;
    }

    let dueIso: string | null = null;
    if (form.due_date) {
      const due = new Date(form.due_date);
      if (Number.isNaN(due.getTime())) {
        alert("Please enter a valid due date");
        return;
      }

      if (due.getTime() < Date.now()) {
        alert("Due date must be in the future");
        return;
      }
      dueIso = due.toISOString();
    }

    const normalizedPackage = (form.package_name.trim() || "Others");

    // Legacy behavior: for new non-self tasks, a routing option must be explicit and valid.
    if (!editingTask && !isSelfTodo) {
      if (!["department", "manager", "multi"].includes(routeMode)) {
        alert("Please select a routing option: Self, Department, Manager, or Multi-Assignment.");
        return;
      }
      if (routeMode === "department" && !form.queue_department.trim()) {
        alert("Please select a department to send this task to.");
        return;
      }
      if (routeMode === "manager" && !form.assigned_to.trim()) {
        alert("Please select a manager to send this task to.");
        return;
      }
      if (routeMode === "multi") {
        const selected = parseCsv(form.assignees_csv)
          .map((x) => x.toLowerCase())
          .filter((x, i, arr) => arr.indexOf(x) === i);
        if (selected.length === 0) {
          alert("Please select at least one user for multi-assignment.");
          return;
        }
      }
    }

    const payload: Record<string, unknown> = {
      title,
      description: form.description.trim() || null,
      our_goal: form.our_goal.trim() || null,
      notes: form.notes.trim() || null,
      priority: form.priority,
      due_date: dueIso,
      app_name: form.app_name.trim() || null,
      package_name: normalizedPackage,
      kpi_type: form.kpi_type.trim() || null,
      attachments: creationFiles.length > 0
        ? JSON.stringify(creationFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })))
        : null,
      username: me,
      status: "open",
      task_status: "backlog",
      approval_status: "approved",
      category: "general",
    };

    if (form.route_mode === "self") {
      payload.assigned_to = form.assigned_to || me;
      payload.manager_id = currentUser?.manager_id || null;
      payload.queue_department = null;
      payload.queue_status = null;
    }

    if (form.route_mode === "manager") {
      if (!form.assigned_to) {
        alert("Please select a manager to send this task to.");
        return;
      }
      payload.assigned_to = form.assigned_to;
      payload.manager_id = form.assigned_to;
      payload.queue_department = null;
      payload.queue_status = null;
    }

    if (form.route_mode === "department") {
      if (!form.queue_department.trim()) {
        alert("Please select a department to send this task to.");
        return;
      }
      payload.assigned_to = null;
      payload.manager_id = null;
      payload.queue_department = form.queue_department.trim();
      payload.queue_status = "queued";
      payload.category = "department";
    }

    const extraAssignees: string[] = [];
    if (form.route_mode === "multi") {
      const all = parseCsv(form.assignees_csv)
        .map((x) => x.toLowerCase())
        .filter((x, i, arr) => arr.indexOf(x) === i);

      if (all.length === 0) {
        alert("Please select at least one user for multi-assignment.");
        return;
      }

      const validUsers = new Set(users.map((u) => u.username.toLowerCase()));
      const invalid = all.filter((u) => !validUsers.has(u));
      if (invalid.length > 0) {
        alert(`Unknown assignee username(s): ${invalid.join(", ")}`);
        return;
      }

      payload.assigned_to = all[0];
      payload.manager_id = null;
      payload.queue_department = null;
      payload.queue_status = null;
      payload.assignment_chain = JSON.stringify(
        all.map((username) => ({
          username,
          role: "assignee",
          status: username === all[0] ? "todo" : "pending",
          timestamp: new Date().toISOString(),
        }))
      );
      extraAssignees.push(...all.slice(1));
    }

    setSaving(true);
    try {
      const method = editingTask ? "PATCH" : "POST";
      const body = editingTask ? { ...payload, id: editingTask.id } : payload;

      const res = await fetch("/api/todos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Could not save task");
      }

      const createdOrUpdated = await res.json();

      if (!editingTask && form.route_mode === "multi" && createdOrUpdated?.id && extraAssignees.length > 0) {
        await Promise.all(
          extraAssignees.map((username) =>
            fetch("/api/todos/shares", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                todo_id: createdOrUpdated.id,
                shared_with: username,
                shared_by: me,
                can_edit: true,
              }),
            })
          )
        );
      }

      await refreshTasks();
      setTaskModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  async function saveTemplateFromForm() {
    const name = templateName.trim();
    if (!name) {
      alert("Template name is required");
      return;
    }
    const id = `${Date.now()}`;
    const res = await fetch("/api/todos/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: me, id, name, form }),
    });
    if (!res.ok) {
      alert("Failed to save template");
      return;
    }
    const saved = await res.json();
    setTemplates((prev) => [saved, ...prev]);
    setTemplateName("");
  }

  function applyTemplate() {
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;
    setForm(tpl.form);
    setTaskModalOpen(true);
  }

  async function deleteTemplate(id: string) {
    const res = await fetch(`/api/todos/templates?username=${encodeURIComponent(me)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete template");
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId("");
  }

  async function saveInlineTask(task: Todo) {
    const title = inlineTitle.trim();
    if (!title) {
      alert("Title is required");
      return;
    }
    const updates: Record<string, unknown> = { title };
    if (inlineDueDate) {
      const due = new Date(inlineDueDate);
      if (Number.isNaN(due.getTime())) {
        alert("Invalid due date");
        return;
      }
      updates.due_date = due.toISOString();
    }
    try {
      await updateTask(task.id, updates);
      setInlineEditId(null);
      setInlineTitle("");
      setInlineDueDate("");
      await refreshTasks();
    } catch {
      alert("Could not save inline edits");
    }
  }

  function downloadAttachment(att: { name?: string; size?: number; type?: string }) {
    const payload = JSON.stringify(att, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${att.name || "attachment"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAttachment(attName: string) {
    if (!detailTask) return;
    const attachments = parseJsonArray<{ name?: string; size?: number; type?: string }>(detailTask.attachments || null);
    const next = attachments.filter((a) => (a.name || "") !== attName);
    try {
      await updateTask(detailTask.id, { attachments: JSON.stringify(next) });
      setDetailTask({ ...detailTask, attachments: JSON.stringify(next) });
      await refreshTasks();
    } catch {
      alert("Could not delete attachment");
    }
  }

  async function moveTaskToStatus(taskId: string, nextStatus: "backlog" | "todo" | "in_progress" | "done") {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const status = nextStatus === "in_progress" ? "in-progress" : nextStatus === "done" ? "completed" : "open";
    const completed = nextStatus === "done";
    try {
      await updateTask(taskId, {
        task_status: nextStatus,
        status,
        completed,
        approval_status: completed ? "approved" : task.approval_status || "approved",
      });
      await refreshTasks();
    } catch {
      alert("Could not move task");
    }
  }

  async function autoAssignQueue(dept: string) {
    const queued = visibleTasks
      .filter((t) => t.queue_department === dept && t.queue_status === "queued")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (queued.length === 0) return;

    const candidates = users
      .filter((u) => (u.department || "").toLowerCase() === dept.toLowerCase())
      .map((u) => {
        const load = visibleTasks.filter((t) => (t.assigned_to || "").toLowerCase() === u.username.toLowerCase() && !isDone(t)).length;
        return { username: u.username, load };
      })
      .sort((a, b) => a.load - b.load);

    if (candidates.length === 0) {
      alert(`No users found in ${dept} department`);
      return;
    }

    try {
      await updateTask(queued[0].id, {
        assigned_to: candidates[0].username,
        queue_status: "claimed",
        task_status: "todo",
      });
      await refreshTasks();
    } catch {
      alert("Auto-assignment failed");
    }
  }

  const queueTasksByDept = useMemo(() => {
    const map = new Map<string, Todo[]>();
    visibleTasks
      .filter((t) => !!t.queue_department && t.queue_status === "queued")
      .forEach((task) => {
        const key = (task.queue_department || "General").trim();
        const current = map.get(key) || [];
        current.push(task);
        map.set(key, current);
      });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleTasks]);

  const approvalDeskTasks = useMemo(() => {
    const isAdmin = isAdminLike(currentUser);
    return visibleTasks.filter((task) => {
      if (task.approval_status !== "pending_approval") return false;
      if (isAdmin) return true;
      return (task.username || "").toLowerCase() === lowerMe;
    });
  }, [visibleTasks, currentUser, lowerMe]);

  async function updateTask(id: string, updates: Record<string, unknown>) {
    const res = await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update task");
    }
  }

  async function runTaskAction(task: Todo, action: "start" | "submit" | "approve" | "decline" | "reopen" | "claim_queue") {
    try {
      if (action === "start") {
        await updateTask(task.id, { task_status: "in_progress", status: "in-progress" });
      }

      if (action === "submit") {
        const creator = (task.username || "").toLowerCase();
        const mine = creator === lowerMe;

        if (mine) {
          await updateTask(task.id, {
            task_status: "done",
            status: "completed",
            approval_status: "approved",
            completed: true,
            completed_by: me,
          });
        } else {
          await updateTask(task.id, {
            task_status: "done",
            status: "pending",
            approval_status: "pending_approval",
            completed: false,
            completed_by: me,
          });
        }
      }

      if (action === "approve") {
        await updateTask(task.id, {
          approval_status: "approved",
          status: "approved",
          completed: true,
          task_status: "done",
        });
      }

      if (action === "decline") return;

      if (action === "reopen") {
        await updateTask(task.id, {
          approval_status: "approved",
          status: "open",
          completed: false,
          task_status: "todo",
        });
      }

      if (action === "claim_queue") {
        await updateTask(task.id, {
          assigned_to: me,
          queue_status: "claimed",
          task_status: "todo",
        });
      }

      await refreshTasks();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Task action failed");
    }
  }

  async function submitDecline() {
    if (!declineTask) return;
    try {
      await updateTask(declineTask.id, {
        approval_status: "declined",
        status: "declined",
        completed: false,
        task_status: "in_progress",
        decline_reason: declineReason.trim() || null,
      });
      setDeclineTask(null);
      setDeclineReason("");
      await refreshTasks();
    } catch {
      alert("Could not decline task");
    }
  }

  async function submitDelegate() {
    if (!delegateTask || !delegateTarget) return;
    try {
      const chain = parseJsonArray<AssignmentChainEntry>(delegateTask.assignment_chain);
      const nextChain = [
        ...chain,
        {
          username: delegateTarget,
          role: "delegate",
          status: "pending",
          message: `Delegated by ${me}`,
          timestamp: new Date().toISOString(),
        },
      ];

      await updateTask(delegateTask.id, {
        assigned_to: delegateTarget,
        task_status: "todo",
        status: "open",
        assignment_chain: JSON.stringify(nextChain),
      });
      setDelegateTask(null);
      setDelegateTarget("");
      await refreshTasks();
    } catch {
      alert("Could not delegate task");
    }
  }

  async function addDetailComment() {
    if (!detailTask || !detailComment.trim()) return;
    try {
      const existing = detailTask.notes ? `${detailTask.notes}\n` : "";
      const nextNotes = `${existing}[${new Date().toLocaleString()}] ${me}: ${detailComment.trim()}`;
      await updateTask(detailTask.id, { notes: nextNotes });
      setDetailComment("");
      await refreshTasks();
      const updated = tasks.find((t) => t.id === detailTask.id);
      if (updated) setDetailTask(updated);
    } catch {
      alert("Could not add comment");
    }
  }

  async function deleteTask(id: string) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/todos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await refreshTasks();
    } catch {
      alert("Could not delete task");
    }
  }

  async function archiveTask(id: string) {
    try {
      await updateTask(id, { archived: true });
      await refreshTasks();
    } catch {
      alert("Could not archive task");
    }
  }

  async function duplicateTask(task: Todo) {
    try {
      const payload = {
        title: `${task.title} (Copy)`,
        description: task.description || null,
        our_goal: task.our_goal || null,
        notes: task.notes || null,
        priority: task.priority || "medium",
        due_date: task.due_date || null,
        app_name: task.app_name || null,
        package_name: task.package_name || "Others",
        kpi_type: task.kpi_type || null,
        username: me,
        assigned_to: task.assigned_to || me,
        manager_id: task.manager_id || null,
        queue_department: task.queue_department || null,
        queue_status: task.queue_status || null,
        status: "open",
        task_status: "todo",
        approval_status: "approved",
        category: task.category || "general",
        attachments: task.attachments || null,
      };
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Duplicate failed");
      await refreshTasks();
    } catch {
      alert("Could not duplicate task");
    }
  }

  async function confirmUpdateDueDate() {
    if (!updateDueTask || !updatedDueDate) return;
    const due = new Date(updatedDueDate);
    if (Number.isNaN(due.getTime()) || due.getTime() < Date.now()) {
      alert("Due date must be in the future");
      return;
    }
    try {
      await updateTask(updateDueTask.id, { due_date: due.toISOString() });
      setUpdateDueTask(null);
      setUpdatedDueDate("");
      await refreshTasks();
    } catch {
      alert("Could not update due date");
    }
  }

  async function shareCurrentTask() {
    if (!shareTask || !shareTarget) return;

    try {
      const res = await fetch("/api/todos/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          todo_id: shareTask.id,
          shared_with: shareTarget,
          shared_by: me,
          can_edit: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Share failed");
      }

      setShareTask(null);
      setShareTarget("");
      await refreshTasks();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Share failed");
    }
  }

  async function confirmBulkShare() {
    if (selectedIds.size === 0) {
      alert("Select at least one task");
      return;
    }
    if (bulkShareUsers.length === 0) {
      alert("Select at least one user");
      return;
    }
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.flatMap((todoId) =>
          bulkShareUsers.map((username) =>
            fetch("/api/todos/shares", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                todo_id: todoId,
                shared_with: username,
                shared_by: me,
                can_edit: true,
              }),
            })
          )
        )
      );
      setBulkShareOpen(false);
      setBulkShareUsers([]);
      await refreshTasks();
    } catch {
      alert("Bulk share failed");
    }
  }

  async function runBulkAction(action: "complete" | "archive" | "delete") {
    if (selectedIds.size === 0) {
      alert("Select at least one task");
      return;
    }

    try {
      const ids = Array.from(selectedIds);

      if (action === "complete") {
        await Promise.all(
          ids.map((id) =>
            updateTask(id, {
              completed: true,
              completed_by: me,
              approval_status: "approved",
              task_status: "done",
              status: "completed",
            })
          )
        );
      }

      if (action === "archive") {
        await Promise.all(ids.map((id) => updateTask(id, { archived: true })));
      }

      if (action === "delete") {
        await Promise.all(
          ids.map((id) => fetch(`/api/todos?id=${encodeURIComponent(id)}`, { method: "DELETE" }))
        );
      }

      setSelectedIds(new Set());
      await refreshTasks();
    } catch {
      alert("Bulk action failed");
    }
  }

  function exportTasks(format: "csv" | "json") {
    const rows = filteredTasks.map((t) => ({
      id: t.id,
      title: t.title,
      created_by: t.username,
      assigned_to: t.assigned_to || "",
      task_status: t.task_status || "",
      approval_status: t.approval_status || "",
      priority: t.priority || "",
      due_date: t.due_date || "",
      app_name: t.app_name || "",
      package_name: t.package_name || "",
      queue_department: t.queue_department || "",
      created_at: t.created_at,
    }));

    let blob: Blob;
    let filename: string;

    if (format === "json") {
      blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
      filename = `tasks-${Date.now()}.json`;
    } else {
      const header = Object.keys(rows[0] || { id: "", title: "" });
      const csv = [header.join(",")]
        .concat(
          rows.map((r) =>
            header
              .map((k) => {
                const value = String((r as Record<string, string>)[k] || "");
                return `"${value.replace(/"/g, '""')}"`;
              })
              .join(",")
          )
        )
        .join("\n");

      blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      filename = `tasks-${Date.now()}.csv`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleSelected(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function selectAllVisible() {
    setSelectedIds(new Set(filteredTasks.map((t) => t.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Loading task module...</div>;
  }

  return (
    <div className="legacy-task-ui space-y-6 p-6">
      <div className="legacy-header legacy-page-header flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-4 dark:border-indigo-900/60 dark:from-indigo-950/30 dark:via-gray-900 dark:to-blue-950/20">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">📝 Task Center</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Same as legacy task module: filters, routing, queue, approvals, templates, and full workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="legacy-user-info rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <span className="font-semibold">{me || "user"}</span>
            <span className="mx-1">•</span>
            <span>{currentUser?.role || "Member"}</span>
          </div>
          <Button variant={panel === "workboard" ? "primary" : "outline"} onClick={() => setPanel("workboard")}>📋 Workboard</Button>
          <Button variant={panel === "queue" ? "primary" : "outline"} onClick={() => setPanel("queue")}>🏢 Queue Board</Button>
          <Button variant={panel === "approval" ? "primary" : "outline"} onClick={() => setPanel("approval")}>✅ Approval Desk</Button>
          <Button variant="outline" onClick={() => exportTasks("csv")}> <Download className="h-4 w-4" /> Export CSV </Button>
          <Button variant="outline" onClick={() => exportTasks("json")}> <Download className="h-4 w-4" /> Export JSON </Button>
          <Button onClick={openCreateModal}> <Plus className="h-4 w-4" /> Add New Task </Button>
        </div>
      </div>

      <div className="legacy-stat-grid grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.title} className="legacy-kpi-card border-gray-200 dark:border-gray-700">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">{k.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{k.value}</p>
              </div>
              <div className="rounded-full bg-primary-100 p-2 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {k.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="legacy-panel">
        <CardHeader className="legacy-panel-head flex flex-wrap items-center gap-3">
          <div className="min-w-[220px] flex-1">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title, app, package, assignee..."
            />
          </div>

          <div className="legacy-filters grid flex-[2] grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            <Select
              label="Quick Filter"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value as QuickFilter)}
              options={[
                ...metadata.quickFilters,
              ]}
            />

            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                ...metadata.statuses.map((s) => ({ value: s, label: titleCase(s) })),
              ]}
            />

            <Select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: "all", label: "All Priorities" },
                ...metadata.priorities.map((p) => ({ value: p, label: titleCase(p) })),
              ]}
            />

            <Select
              label="Date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              options={[
                ...metadata.dateFilters,
              ]}
            />

            <Select
              label="Messages"
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
              options={[
                ...metadata.messageFilters,
              ]}
            />

            <Select
              label="Assignee"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              options={assigneeOptions}
            />

            <Select
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={departmentOptions}
            />

            <Select
              label="Sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                ...metadata.sortOptions,
              ]}
            />

            {dateFilter === "custom" && (
              <div className="col-span-1 flex items-end gap-2 md:col-span-2 xl:col-span-2">
                <Input label="From" type="date" value={customDateFrom} onChange={(e) => setCustomDateFrom(e.target.value)} />
                <Input label="To" type="date" value={customDateTo} onChange={(e) => setCustomDateTo(e.target.value)} />
              </div>
            )}

            <div className="flex items-end gap-2">
              <Button variant={viewMode === "list" ? "primary" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                <ListTodo className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "kanban" ? "primary" : "outline"} size="sm" onClick={() => setViewMode("kanban")}>
                <Kanban className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "calendar" ? "primary" : "outline"} size="sm" onClick={() => setViewMode("calendar")}>
                <CalendarDays className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="legacy-panel-body space-y-3">
          <div className="grid gap-2 rounded border border-gray-200 p-2 md:grid-cols-[1fr_220px_auto] dark:border-gray-700">
            <Input placeholder="Template name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            <Select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              options={[
                { value: "", label: "Select template" },
                ...templates.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={saveTemplateFromForm}>Save Template</Button>
              <Button variant="outline" onClick={applyTemplate}>Apply</Button>
            </div>
          </div>

          {templates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-xs ${
                    selectedTemplateId === tpl.id
                      ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                      : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                  }`}
                >
                  {tpl.name}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTemplate(tpl.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        deleteTemplate(tpl.id);
                      }
                    }}
                    className="rounded bg-red-100 px-1 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                  >
                    x
                  </span>
                </button>
              ))}
            </div>
          )}

          {panel === "queue" && (
            <div className="space-y-3 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/20">
              {queueTasksByDept.length === 0 && (
                <div className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
                  No queued tasks available.
                </div>
              )}

              {queueTasksByDept.map(([dept, deptTasks]) => (
                <div key={dept} className="rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-gray-900 dark:text-white">{dept}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{deptTasks.length}</Badge>
                      <Button size="sm" variant="outline" onClick={() => autoAssignQueue(dept)}>
                        Auto Assign
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {deptTasks.map((task) => (
                      <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                          <p className="text-xs text-gray-500">By {task.username} • Due {task.due_date ? formatDate(task.due_date) : "--"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => runTaskAction(task, "claim_queue")}>Pick Queue</Button>
                          <Button size="sm" variant="outline" onClick={() => setDetailTask(task)}>Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {panel === "approval" && (
            <div className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/20">
              {approvalDeskTasks.length === 0 && (
                <div className="rounded border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
                  No tasks waiting for approval.
                </div>
              )}
              {approvalDeskTasks.map((task) => (
                <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-200 bg-white p-2 dark:border-amber-900/60 dark:bg-gray-800">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-gray-500">Submitted by {task.completed_by || task.assigned_to || "--"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" onClick={() => runTaskAction(task, "approve")}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => { setDeclineTask(task); setDeclineReason(task.decline_reason || ""); }}>Decline</Button>
                    <Button size="sm" variant="outline" onClick={() => setDetailTask(task)}>Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {panel === "workboard" && (
            <>
          <div className="flex flex-wrap gap-2 rounded border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900/20">
            {metadata.quickFilters.map((item) => {
              const key = item.value as QuickFilter;
              const active = quickFilter === key;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setQuickFilter(key)}
                  className={`inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-semibold ${
                    active
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {item.label}
                  <span className="rounded bg-black/10 px-1.5 py-0.5">{quickFilterCounts[key] || 0}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded border border-dashed border-gray-300 p-2 text-xs dark:border-gray-700">
            <ListFilter className="h-4 w-4" />
            <span className="font-semibold">Smart Lists:</span>
            {metadata.smartLists.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSmartList(item.value as SmartList)}
                className={`rounded px-2 py-1 ${
                  smartList === item.value
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/30">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Filter className="h-4 w-4" />
              <span>{filteredTasks.length} filtered tasks</span>
              <span>{selectedIds.size} selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAllVisible}>Select All</Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>Clear</Button>
              <Button variant="outline" size="sm" onClick={() => setBulkShareOpen(true)}>Bulk Share</Button>
              <Button variant="success" size="sm" onClick={() => runBulkAction("complete")}>Complete</Button>
              <Button variant="outline" size="sm" onClick={() => runBulkAction("archive")}>Archive</Button>
              <Button variant="danger" size="sm" onClick={() => runBulkAction("delete")}>Delete</Button>
            </div>
          </div>

          {viewMode === "list" && (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const mine = (task.assigned_to || "").toLowerCase() === lowerMe;
                const canApprove = (task.username || "").toLowerCase() === lowerMe && task.approval_status === "pending_approval";
                const isQueued = !!task.queue_department && task.queue_status === "queued";

                return (
                  <div
                    key={task.id}
                    className="legacy-list-task grid grid-cols-1 gap-2 rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 lg:grid-cols-[28px_1fr_auto]"
                  >
                    <div className="pt-1">
                      <input type="checkbox" checked={selectedIds.has(task.id)} onChange={() => toggleSelected(task.id)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {inlineEditId === task.id ? (
                          <Input
                            value={inlineTitle}
                            onChange={(e) => setInlineTitle(e.target.value)}
                            placeholder="Task title"
                          />
                        ) : (
                          <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                        )}
                        <Badge variant="outline">{task.task_status || "todo"}</Badge>
                        <Badge variant={task.priority === "urgent" ? "danger" : task.priority === "high" ? "danger" : task.priority === "low" ? "info" : "warning"}>
                          {task.priority || "medium"}
                        </Badge>
                        {task.approval_status === "pending_approval" && <Badge variant="warning">Approval Pending</Badge>}
                        {task.queue_department && <Badge variant="info">Queue: {task.queue_department}</Badge>}
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        <span>By {task.username}</span>
                        <span className="mx-2">•</span>
                        <span>Assigned: {task.assigned_to || "Unassigned"}</span>
                        <span className="mx-2">•</span>
                        {inlineEditId === task.id ? (
                          <span className="inline-block min-w-[220px]">
                            <Input
                              type="datetime-local"
                              value={inlineDueDate}
                              onChange={(e) => setInlineDueDate(e.target.value)}
                            />
                          </span>
                        ) : (
                          <span>Due: {task.due_date ? formatDate(task.due_date) : "--"}</span>
                        )}
                        {task.app_name && (
                          <>
                            <span className="mx-2">•</span>
                            <span>App: {task.app_name}</span>
                          </>
                        )}
                        {task.package_name && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Package: {task.package_name}</span>
                          </>
                        )}
                      </div>

                      {task.description && <p className="text-sm text-gray-700 dark:text-gray-200">{task.description}</p>}
                    </div>

                    <div className="flex flex-wrap items-start justify-end gap-1">
                      {isQueued && (
                        <button type="button" className="legacy-action-pill legacy-action-pick" onClick={() => runTaskAction(task, "claim_queue")}>📥 Pick</button>
                      )}

                      {(mine || isAdminLike(currentUser)) && task.task_status !== "in_progress" && !isDone(task) && (
                        <button type="button" className="legacy-action-pill legacy-action-start" onClick={() => runTaskAction(task, "start")}>🚀 Start</button>
                      )}

                      {(mine || isAdminLike(currentUser)) && !isDone(task) && (
                        <button type="button" className="legacy-action-pill legacy-action-submit" onClick={() => runTaskAction(task, "submit")}>⚡ Submit</button>
                      )}

                      {canApprove && (
                        <>
                          <button type="button" className="legacy-action-pill legacy-action-approve" onClick={() => runTaskAction(task, "approve")}>👍 Approve</button>
                          <button type="button" className="legacy-action-pill legacy-action-decline" onClick={() => { setDeclineTask(task); setDeclineReason(task.decline_reason || ""); }}>👎 Decline</button>
                        </>
                      )}

                      {!isDone(task) && (
                        <button type="button" className="legacy-icon-chip legacy-icon-chip-neutral" onClick={() => { setDelegateTask(task); setDelegateTarget(""); }} title="Delegate">🔁</button>
                      )}

                      {isDone(task) && (
                        <button type="button" className="legacy-action-pill legacy-action-reopen" onClick={() => runTaskAction(task, "reopen")}>↩️ Reopen</button>
                      )}

                      <button type="button" className="legacy-icon-chip legacy-icon-chip-view" onClick={() => setDetailTask(task)} title="View">👁️</button>
                      <button type="button" className="legacy-icon-chip legacy-icon-chip-edit" onClick={() => openEditModal(task)} title="Edit">✏️</button>
                      <button type="button" className="legacy-icon-chip legacy-icon-chip-dup" onClick={() => duplicateTask(task)} title="Duplicate">📋</button>
                      {!isDone(task) && (
                        <button
                          type="button"
                          className="legacy-icon-chip legacy-icon-chip-date"
                          onClick={() => {
                            setUpdateDueTask(task);
                            setUpdatedDueDate(toInputDateTime(task.due_date));
                          }}
                          title="Update Due Date"
                        >
                          📅
                        </button>
                      )}
                      {inlineEditId === task.id ? (
                        <>
                          <button type="button" className="legacy-action-pill legacy-action-approve" onClick={() => saveInlineTask(task)}>✅ Save</button>
                          <button type="button" className="legacy-action-pill legacy-action-reopen" onClick={() => setInlineEditId(null)}>Cancel</button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="legacy-action-pill legacy-action-reopen"
                          onClick={() => {
                            setInlineEditId(task.id);
                            setInlineTitle(task.title || "");
                            setInlineDueDate(toInputDateTime(task.due_date));
                          }}
                        >
                          Quick Edit
                        </button>
                      )}
                      <button type="button" className="legacy-icon-chip legacy-icon-chip-share" onClick={() => setShareTask(task)} title="Share">👥</button>
                      <button type="button" className="legacy-icon-chip legacy-icon-chip-archive" onClick={() => archiveTask(task.id)} title="Archive">📦</button>
                      <button type="button" className="legacy-icon-chip legacy-icon-chip-delete" onClick={() => deleteTask(task.id)} title="Delete">🗑️</button>
                    </div>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="rounded border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
                  No tasks match current filters.
                </div>
              )}
            </div>
          )}

          {viewMode === "kanban" && (
            <div className="legacy-kanban-grid grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { key: "backlog", label: "Backlog" },
                { key: "todo", label: "To Do" },
                { key: "in_progress", label: "In Progress" },
                { key: "done", label: "Done" },
              ].map((col) => {
                const colTasks = filteredTasks.filter((t) => (t.task_status || "todo") === col.key);
                return (
                  <div
                    key={col.key}
                    className="legacy-kanban-column rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/30"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async () => {
                      if (!dragTaskId) return;
                      await moveTaskToStatus(dragTaskId, col.key as "backlog" | "todo" | "in_progress" | "done");
                      setDragTaskId(null);
                    }}
                  >
                    <div className="legacy-kanban-header mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{col.label}</p>
                      <Badge variant="outline">{colTasks.length}</Badge>
                    </div>

                    <div className="space-y-2">
                      {colTasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          draggable
                          onDragStart={() => setDragTaskId(task.id)}
                          onDragEnd={() => setDragTaskId(null)}
                          onClick={() => setDetailTask(task)}
                          className="legacy-kanban-task w-full rounded border border-gray-200 bg-white p-2 text-left hover:border-primary-400 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{task.title}</p>
                          <p className="mt-1 text-xs text-gray-500">{task.assigned_to || "Unassigned"}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant={task.priority === "urgent" ? "danger" : task.priority === "high" ? "danger" : task.priority === "low" ? "info" : "warning"}>
                              {task.priority || "medium"}
                            </Badge>
                            <span className="text-xs text-gray-500">{task.due_date ? formatDate(task.due_date) : "No due"}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === "calendar" && (
            <div className="space-y-3">
              {Object.entries(
                filteredTasks
                  .filter((t) => !!t.due_date)
                  .sort((a, b) => new Date(a.due_date || "").getTime() - new Date(b.due_date || "").getTime())
                  .reduce((acc, task) => {
                    const key = new Date(task.due_date || "").toISOString().slice(0, 10);
                    if (!acc[key]) acc[key] = [] as Todo[];
                    acc[key].push(task);
                    return acc;
                  }, {} as Record<string, Todo[]>)
              ).map(([day, dayTasks]) => (
                <div key={day} className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/30">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(day)}</p>
                    <Badge variant="outline">{dayTasks.length}</Badge>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {dayTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => setDetailTask(task)}
                        className="rounded border border-gray-200 bg-white p-2 text-left hover:border-primary-400 dark:border-gray-700 dark:bg-gray-800"
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.assigned_to || "Unassigned"} • {task.task_status || "todo"}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge variant="outline">{task.priority || "medium"}</Badge>
                          <span className="text-xs text-gray-500">{task.due_date ? formatDate(task.due_date) : "--"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {filteredTasks.filter((t) => !!t.due_date).length === 0 && (
                <div className="rounded border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
                  Calendar view has no due dates for current filters.
                </div>
              )}
            </div>
          )}
            </>
          )}
        </CardContent>
      </Card>

      <Modal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          if (!editingTask) resetForm();
        }}
        title={editingTask ? "📝 Edit Task" : "📝 Add New Task"}
        className="legacy-todo-modal"
        size="xl"
      >
        <div className="legacy-task-form-grid grid gap-3 md:grid-cols-2">
          <Select
            label="App / Game Name"
            value={form.app_name}
            onChange={(e) => syncAppToPackage(e.target.value)}
            options={[{ value: "", label: "-- Select App / Game --" }, ...appOptions.map((v) => ({ value: v, label: v }))]}
          />
          <Select
            label="Package Name"
            value={form.package_name}
            onChange={(e) => syncPackageToApp(e.target.value)}
            options={[{ value: "", label: "-- Select Package --" }, ...packageOptions.map((v) => ({ value: v, label: v }))]}
          />

          <Select
            label="KPI's"
            value={form.kpi_type}
            onChange={(e) => setForm((p) => ({ ...p, kpi_type: e.target.value }))}
            options={[{ value: "", label: "-- Select KPI --" }, ...metadata.kpiTypes.map((k) => ({ value: k, label: k }))]}
          />

          <div className="rounded border border-gray-200 p-2 text-xs dark:border-gray-700">
            <p className="font-semibold text-gray-600 dark:text-gray-300">Subject Count</p>
            <p className={`${form.title.length > 30 || form.title.length < 3 ? "text-red-600" : "text-gray-600"}`}>{form.title.length}/30</p>
          </div>

          <Input
            label="Subject"
            maxLength={30}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="What needs to be done?"
          />

          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskForm["priority"] }))}
            options={[
              ...metadata.priorities.map((priority) => ({ value: priority, label: titleCase(priority) })),
            ]}
          />

          <div className="md:col-span-2">
            <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="md:col-span-2 rounded border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 border-b border-gray-200 p-2 dark:border-gray-700">
              <Button type="button" size="sm" variant="outline" onClick={() => formatOurGoal("bold")}>B</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => formatOurGoal("italic")}><i>I</i></Button>
              <Button type="button" size="sm" variant="outline" onClick={() => formatOurGoal("underline")}><u>U</u></Button>
              <Button type="button" size="sm" variant="outline" onClick={() => formatOurGoal("insertUnorderedList")}>• List</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => formatOurGoal("insertOrderedList")}>1. List</Button>
            </div>
            <div
              ref={ourGoalRef}
              contentEditable
              className="min-h-[120px] p-3 text-sm text-gray-900 outline-none dark:text-gray-100"
              onInput={(e) => setForm((p) => ({ ...p, our_goal: (e.currentTarget as HTMLDivElement).innerHTML }))}
              dangerouslySetInnerHTML={{ __html: form.our_goal || "" }}
            />
          </div>

          <Input label="Due Date" type="datetime-local" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
          <div className="rounded border border-gray-200 p-2 text-xs dark:border-gray-700">
            <p className="font-semibold text-gray-600 dark:text-gray-300">Due Date Rule</p>
            <p className="text-gray-500">Must be future date/time.</p>
          </div>

          <div className="md:col-span-2">
            <Input label="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="md:col-span-2 rounded border border-gray-200 p-3 dark:border-gray-700">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Attachments (Optional)</p>
              <label className="cursor-pointer text-xs font-semibold text-primary-600 dark:text-primary-300">
                + Add Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setCreationFiles((prev) => [...prev, ...files]);
                  }}
                />
              </label>
            </div>
            {creationFiles.length === 0 && <p className="text-xs text-gray-500">No files selected.</p>}
            <div className="space-y-1">
              {creationFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-xs dark:border-gray-700">
                  <span>{file.name} ({Math.ceil(file.size / 1024)} KB)</span>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => setCreationFiles((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded border border-gray-200 p-3 dark:border-gray-700">
          <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Routing</p>

          <div className="grid gap-3 md:grid-cols-3">
            {metadata.routingModes.map((opt) => (
              (() => {
                const mode = opt.value as TaskForm["route_mode"];
                const meta = ROUTE_META[mode] || {
                  emoji: "➡️",
                  title: opt.label,
                  subtitle: "Route task",
                };
                return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, route_mode: opt.value as TaskForm["route_mode"] }))}
                className={`legacy-route-card rounded-xl border p-3 text-left text-sm transition-all ${
                  form.route_mode === opt.value
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="legacy-route-emoji flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 text-lg dark:from-indigo-900/50 dark:to-blue-900/40">
                    {meta.emoji}
                  </div>
                  <div>
                    <p className="font-semibold">{meta.title}</p>
                    <p className="text-xs opacity-80">{meta.subtitle}</p>
                  </div>
                </div>
              </button>
                );
              })()
            ))}
          </div>

          {form.route_mode === "self" && (
            <div className="mt-3">
              <Select
                label="Assign To"
                value={form.assigned_to}
                onChange={(e) => setForm((p) => ({ ...p, assigned_to: e.target.value }))}
                options={[
                  { value: "", label: "Me (default)" },
                  ...users.map((u) => ({ value: u.username, label: u.username })),
                ]}
              />
            </div>
          )}

          {form.route_mode === "manager" && (
            <div className="mt-3">
              <Select
                label="Manager"
                value={form.assigned_to}
                onChange={(e) => setForm((p) => ({ ...p, assigned_to: e.target.value }))}
                options={[{ value: "", label: "Select manager" }, ...managerOptions]}
              />
            </div>
          )}

          {form.route_mode === "department" && (
            <div className="mt-3">
              <Input
                label="Queue Department"
                value={form.queue_department}
                onChange={(e) => setForm((p) => ({ ...p, queue_department: e.target.value }))}
                placeholder="e.g. SEO, PPC, Design"
              />
            </div>
          )}

          {form.route_mode === "multi" && (
            <div className="mt-3">
              <Input
                label="Assignees (comma separated usernames)"
                value={form.assignees_csv}
                onChange={(e) => setForm((p) => ({ ...p, assignees_csv: e.target.value }))}
                placeholder="user1, user2, user3"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={resetForm}>Clear Draft</Button>
          <Button variant="outline" onClick={() => setTaskModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={submitTask}>{editingTask ? "Update Task" : "Create Task"}</Button>
        </div>
      </Modal>

      <Modal open={!!detailTask} onClose={() => setDetailTask(null)} title="Task Details" size="lg">
        {detailTask && (
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{detailTask.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{detailTask.description || "No description"}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Created By:</strong> {detailTask.username}</p>
              <p><strong>Assigned To:</strong> {detailTask.assigned_to || "Unassigned"}</p>
              <p><strong>Task Status:</strong> {detailTask.task_status || "todo"}</p>
              <p><strong>Approval:</strong> {detailTask.approval_status || "approved"}</p>
              <p><strong>Priority:</strong> {detailTask.priority || "medium"}</p>
              <p><strong>Due:</strong> {detailTask.due_date ? formatDate(detailTask.due_date) : "--"}</p>
              <p><strong>App:</strong> {detailTask.app_name || "--"}</p>
              <p><strong>Package:</strong> {detailTask.package_name || "--"}</p>
              <p><strong>Queue:</strong> {detailTask.queue_department || "--"}</p>
              <p><strong>Queue Status:</strong> {detailTask.queue_status || "--"}</p>
            </div>

            {detailTask.our_goal && (
              <div className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
                <p className="font-semibold">Our Goal</p>
                <p>{detailTask.our_goal}</p>
              </div>
            )}

            {detailTask.notes && (
              <div className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
                <p className="font-semibold">Notes</p>
                <p>{detailTask.notes}</p>
              </div>
            )}

            <div className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
              <p className="mb-2 font-semibold">Comments</p>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {(detailTask.notes || "")
                  .split("\n")
                  .filter((line) => line.trim().startsWith("["))
                  .slice()
                  .reverse()
                  .map((line, idx) => (
                    <div key={`${idx}-${line.slice(0, 10)}`} className="rounded bg-gray-50 px-2 py-1 text-xs dark:bg-gray-800/60">
                      {line}
                    </div>
                  ))}
                {(detailTask.notes || "").split("\n").filter((line) => line.trim().startsWith("[")).length === 0 && (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>
            </div>

            {!!detailTask.decline_reason && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-sm dark:border-red-900 dark:bg-red-950/30">
                <p className="font-semibold text-red-700 dark:text-red-300">Decline Reason</p>
                <p className="text-red-700 dark:text-red-300">{detailTask.decline_reason}</p>
              </div>
            )}

            <div className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
              <p className="mb-2 font-semibold">Assignment Chain</p>
              {parseJsonArray<AssignmentChainEntry>(detailTask.assignment_chain).length === 0 && (
                <p className="text-gray-500">No assignment chain records.</p>
              )}
              <div className="space-y-1">
                {parseJsonArray<AssignmentChainEntry>(detailTask.assignment_chain).map((entry, idx) => (
                  <div key={`${entry.username}-${idx}`} className="flex items-center gap-2 text-xs">
                    <CornerDownRight className="h-3 w-3" />
                    <span className="font-semibold">{entry.username}</span>
                    <span>{entry.role || "role"}</span>
                    <Badge variant="outline">{entry.status || "pending"}</Badge>
                    {entry.timestamp && <span className="text-gray-500">{formatDate(entry.timestamp)}</span>}
                  </div>
                ))}
              </div>
            </div>

            {parseJsonArray<AssignmentChainEntry>(detailTask.assignment_chain).length > 1 && (
              <div className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
                <p className="mb-2 font-semibold">Multi-Assignment Progress</p>
                <div className="space-y-1">
                  {parseJsonArray<AssignmentChainEntry>(detailTask.assignment_chain).map((entry, idx) => (
                    <div key={`multi-${entry.username}-${idx}`} className="flex items-center justify-between rounded bg-gray-50 px-2 py-1 text-xs dark:bg-gray-800/60">
                      <span>{entry.username}</span>
                      <Badge variant="outline">{entry.status || "pending"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
              <p className="mb-2 font-semibold">Task History</p>
              {parseJsonArray<TaskHistoryEntry>(detailTask.history).length === 0 && (
                <p className="text-gray-500">No history entries.</p>
              )}
              <div className="space-y-1">
                {parseJsonArray<TaskHistoryEntry>(detailTask.history).map((entry, idx) => (
                  <div key={`${entry.timestamp}-${idx}`} className="text-xs">
                    <span className="font-semibold">{entry.user}</span>
                    <span className="mx-1">•</span>
                    <span>{entry.details}</span>
                    <span className="mx-1">•</span>
                    <span className="text-gray-500">{formatDate(entry.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
              <p className="mb-2 font-semibold">Attachments</p>
              {parseJsonArray<{ name?: string; size?: number; type?: string }>(detailTask.attachments || null).length === 0 && (
                <p className="text-gray-500">No attachments.</p>
              )}
              <div className="space-y-1">
                {parseJsonArray<{ name?: string; size?: number; type?: string }>(detailTask.attachments || null).map((att, idx) => (
                  <div key={`${att.name || "file"}-${idx}`} className="flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-xs dark:border-gray-700">
                    <span>{att.name || "file"}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{att.size ? `${Math.ceil(att.size / 1024)} KB` : ""}</span>
                      <button
                        type="button"
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        onClick={() => downloadAttachment(att)}
                      >
                        Download
                      </button>
                      {(detailTask.username === me || isAdminLike(currentUser)) && (
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => deleteAttachment(att.name || "")}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-gray-200 p-2 text-sm dark:border-gray-700">
              <p className="mb-2 font-semibold">Add Comment</p>
              <div className="flex gap-2">
                <Input value={detailComment} onChange={(e) => setDetailComment(e.target.value)} placeholder="Write update or question..." />
                <Button onClick={addDetailComment}><MessageSquare className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!declineTask} onClose={() => setDeclineTask(null)} title="Decline Task" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">Add reason for declining this task.</p>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={4}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
            placeholder="Reason"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeclineTask(null)}>Cancel</Button>
            <Button variant="danger" onClick={submitDecline}>Decline</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!delegateTask} onClose={() => setDelegateTask(null)} title="Delegate Task" size="sm">
        <div className="space-y-3">
          <Select
            label="Delegate To"
            value={delegateTarget}
            onChange={(e) => setDelegateTarget(e.target.value)}
            options={[
              { value: "", label: "Select user" },
              ...users
                .filter((u) => u.username !== me)
                .map((u) => ({ value: u.username, label: `${u.username} (${u.role})` })),
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDelegateTask(null)}>Cancel</Button>
            <Button onClick={submitDelegate}>Delegate</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!shareTask} onClose={() => setShareTask(null)} title="Share Task" size="sm">
        <div className="space-y-3">
          <Select
            label="Share With"
            value={shareTarget}
            onChange={(e) => setShareTarget(e.target.value)}
            options={[
              { value: "", label: "Select user" },
              ...users
                .filter((u) => u.username !== me)
                .map((u) => ({ value: u.username, label: `${u.username} (${u.role})` })),
            ]}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShareTask(null)}>Cancel</Button>
            <Button onClick={shareCurrentTask}>Share</Button>
          </div>
        </div>
      </Modal>

      <Modal open={bulkShareOpen} onClose={() => setBulkShareOpen(false)} title="Bulk Share Tasks" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Share {selectedIds.size} selected task(s) with multiple users.
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded border border-gray-200 p-2 dark:border-gray-700">
            {users
              .filter((u) => u.username !== me)
              .map((u) => {
                const checked = bulkShareUsers.includes(u.username);
                return (
                  <label key={u.username} className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) setBulkShareUsers((prev) => [...prev, u.username]);
                        else setBulkShareUsers((prev) => prev.filter((x) => x !== u.username));
                      }}
                    />
                    <span>{u.username}</span>
                    <span className="text-xs text-gray-500">({u.role})</span>
                  </label>
                );
              })}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBulkShareOpen(false)}>Cancel</Button>
            <Button onClick={confirmBulkShare}>Share Selected</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!updateDueTask} onClose={() => setUpdateDueTask(null)} title="Update Due Date" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Update due date for <strong>{updateDueTask?.title || "task"}</strong>.
          </p>
          <Input
            label="New Due Date"
            type="datetime-local"
            value={updatedDueDate}
            onChange={(e) => setUpdatedDueDate(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUpdateDueTask(null)}>Cancel</Button>
            <Button onClick={confirmUpdateDueDate}>Update</Button>
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .legacy-task-ui {
          --legacy-border: #e2e8f0;
          --legacy-soft: #f8fafc;
          --legacy-accent: #2563eb;
          --legacy-accent-hover: #1d4ed8;
          --legacy-black: #0f172a;
          --legacy-gray: #64748b;
        }

        .legacy-task-ui .legacy-page-header {
          background: #ffffff;
          color: var(--legacy-black);
          border: 1px solid var(--legacy-border);
          border-radius: 12px;
          padding: 20px 24px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
        }

        .legacy-task-ui .legacy-page-header h1 {
          font-size: 32px;
          letter-spacing: -0.5px;
          gap: 12px;
        }

        .legacy-task-ui .legacy-page-header p {
          font-size: 16px;
          margin-top: 8px;
          opacity: 0.95;
          color: var(--legacy-gray);
        }

        .legacy-task-ui .legacy-user-info {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 8px 16px;
          background: #f8fafc;
          border: 1px solid var(--legacy-border);
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }

        .legacy-task-ui .legacy-panel {
          border-radius: 12px;
          border: 1px solid var(--legacy-border);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }

        .legacy-task-ui .legacy-panel-head {
          border-bottom: 1px solid var(--legacy-border);
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }

        .legacy-task-ui .legacy-panel-body {
          background: #ffffff;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        .legacy-task-ui .legacy-stat-grid {
          gap: 24px;
          margin-bottom: 6px;
        }

        .legacy-task-ui .legacy-kpi-card {
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--legacy-border);
          padding: 4px;
        }

        .legacy-task-ui .legacy-filters label {
          font-weight: 700;
          color: var(--legacy-black);
          font-size: 14px;
        }

        .legacy-task-ui .legacy-route-card {
          background: #ffffff;
          border-width: 2px;
        }

        .legacy-task-ui .legacy-route-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }

        .legacy-task-ui .legacy-action-pill {
          height: 36px;
          border: none;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .legacy-task-ui .legacy-action-pill:hover {
          transform: scale(1.02);
        }

        .legacy-task-ui .legacy-action-pick { background: #0ea5e9; color: #fff; box-shadow: 0 2px 4px rgba(14,165,233,0.3); }
        .legacy-task-ui .legacy-action-start { background: #10b981; color: #fff; box-shadow: 0 2px 4px rgba(16,185,129,0.3); }
        .legacy-task-ui .legacy-action-submit { background: #8b5cf6; color: #fff; box-shadow: 0 2px 4px rgba(139,92,246,0.3); }
        .legacy-task-ui .legacy-action-approve { background: #22c55e; color: #fff; box-shadow: 0 2px 4px rgba(34,197,94,0.3); }
        .legacy-task-ui .legacy-action-decline { background: #ef4444; color: #fff; box-shadow: 0 2px 4px rgba(239,68,68,0.3); }
        .legacy-task-ui .legacy-action-reopen { background: #e2e8f0; color: #475569; }

        .legacy-task-ui .legacy-icon-chip {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s;
        }

        .legacy-task-ui .legacy-icon-chip-view { background: #e0f2fe; }
        .legacy-task-ui .legacy-icon-chip-view:hover { background: #bae6fd; }
        .legacy-task-ui .legacy-icon-chip-edit { background: #f1f5f9; }
        .legacy-task-ui .legacy-icon-chip-edit:hover { background: #e2e8f0; }
        .legacy-task-ui .legacy-icon-chip-dup { background: #f0f9ff; }
        .legacy-task-ui .legacy-icon-chip-dup:hover { background: #dbeafe; }
        .legacy-task-ui .legacy-icon-chip-date { background: #eef2ff; }
        .legacy-task-ui .legacy-icon-chip-date:hover { background: #e0e7ff; }
        .legacy-task-ui .legacy-icon-chip-share { background: #e0e7ff; }
        .legacy-task-ui .legacy-icon-chip-share:hover { background: #c7d2fe; }
        .legacy-task-ui .legacy-icon-chip-archive { background: #fef3c7; }
        .legacy-task-ui .legacy-icon-chip-archive:hover { background: #fde68a; }
        .legacy-task-ui .legacy-icon-chip-delete { background: #fef2f2; }
        .legacy-task-ui .legacy-icon-chip-delete:hover { background: #fee2e2; }
        .legacy-task-ui .legacy-icon-chip-neutral { background: #e2e8f0; }
        .legacy-task-ui .legacy-icon-chip-neutral:hover { background: #cbd5e1; }

        .legacy-task-ui .legacy-list-task {
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--legacy-border);
        }

        .legacy-task-ui .legacy-list-task:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .legacy-task-ui .legacy-kanban-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          align-items: flex-start;
        }

        .legacy-task-ui .legacy-kanban-column {
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid var(--legacy-border);
          max-height: 85vh;
          display: flex;
          flex-direction: column;
        }

        .legacy-task-ui .legacy-kanban-header {
          padding: 12px 14px;
          border-bottom: 1px solid var(--legacy-border);
        }

        .legacy-task-ui .legacy-kanban-task {
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--legacy-border);
          transition: all 0.2s ease;
        }

        .legacy-task-ui .legacy-kanban-task:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .legacy-task-ui button,
        .legacy-task-ui input,
        .legacy-task-ui select,
        .legacy-task-ui textarea {
          border-radius: 8px;
          font-family: Inter, sans-serif;
        }

        .legacy-task-ui input,
        .legacy-task-ui select,
        .legacy-task-ui textarea {
          border: 1px solid var(--legacy-border);
          padding: 14px 18px;
          font-size: 15px;
        }

        .legacy-task-ui input:focus,
        .legacy-task-ui select:focus,
        .legacy-task-ui textarea:focus {
          outline: none;
          border-color: var(--legacy-accent);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .legacy-task-ui button {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .legacy-task-ui [role="dialog"] {
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .legacy-task-ui .legacy-todo-modal {
          border-radius: 12px;
          overflow: hidden;
        }

        .legacy-task-ui .legacy-todo-modal > div:first-child {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #fff;
          border-bottom: none;
          padding: 24px 30px;
        }

        .legacy-task-ui .legacy-todo-modal > div:first-child h2 {
          color: #fff;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        .legacy-task-ui .legacy-todo-modal > div:first-child button {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .legacy-task-ui .legacy-todo-modal > div:last-child {
          padding: 30px;
        }

        .legacy-task-ui .legacy-task-form-grid > div,
        .legacy-task-ui .legacy-task-form-grid > label {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
