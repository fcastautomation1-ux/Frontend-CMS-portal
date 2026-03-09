"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowRightLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CornerDownRight,
  Columns3,
  Download,
  Eye,
  Filter,
  ListFilter,
  Kanban,
  ListTodo,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Share2,
  Trash2,
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
  priority: "high" | "medium" | "low" | null;
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
  | "approval_all";

type ViewMode = "list" | "kanban" | "calendar";

type SmartList = "none" | "overdue" | "due_today" | "unassigned" | "queued" | "created_by_me";

type TaskForm = {
  title: string;
  description: string;
  our_goal: string;
  notes: string;
  priority: "high" | "medium" | "low";
  due_date: string;
  app_name: string;
  package_name: string;
  kpi_type: string;
  route_mode: "self" | "department" | "manager";
  assigned_to: string;
  queue_department: string;
};

const FORM_DRAFT_KEY = "legacy_tasks_form_draft_v2";

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
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [smartList, setSmartList] = useState<SmartList>("none");

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

  const lowerMe = me.toLowerCase();

  useEffect(() => {
    async function load() {
      if (!me) {
        setLoading(false);
        return;
      }

      try {
        const [userRes, usersRes, todoRes, shareRes] = await Promise.all([
          fetch(`/api/users?username=${encodeURIComponent(me)}`, { cache: "no-store" }),
          fetch("/api/users", { cache: "no-store" }),
          fetch("/api/todos", { cache: "no-store" }),
          fetch(`/api/todos/shares?shared_with=${encodeURIComponent(me)}`, { cache: "no-store" }),
        ]);

        if (!userRes.ok || !usersRes.ok || !todoRes.ok || !shareRes.ok) {
          throw new Error("Failed to load data");
        }

        const userJson = await userRes.json();
        const usersJson = await usersRes.json();
        const todoJson = await todoRes.json();
        const shareJson = await shareRes.json();

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

      if (statusFilter !== "all") {
        if (statusFilter === "pending_approval") {
          if (!pendingApproval) return false;
        } else if ((task.task_status || "") !== statusFilter) {
          return false;
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
        if (dateFilter === "overdue" && !(due < todayStart && !isDone(task))) return false;
        if (dateFilter === "next7") {
          const next7 = new Date(now);
          next7.setDate(now.getDate() + 7);
          if (!(due >= todayStart && due <= endOfDay(next7))) return false;
        }
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

      if (smartList !== "none") {
        if (smartList === "overdue") {
          if (!task.due_date || !(new Date(task.due_date) < todayStart && !isDone(task))) return false;
        }
        if (smartList === "due_today") {
          if (!task.due_date) return false;
          const due = new Date(task.due_date);
          if (due < todayStart || due > todayEnd) return false;
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
        const rank = { high: 0, medium: 1, low: 2 } as const;
        const pa = rank[(a.priority || "medium") as keyof typeof rank] ?? 1;
        const pb = rank[(b.priority || "medium") as keyof typeof rank] ?? 1;
        return pa - pb;
      }
      return 0;
    });

    return sorted;
  }, [visibleTasks, quickFilter, statusFilter, priorityFilter, dateFilter, assigneeFilter, departmentFilter, search, smartList, sortBy, lowerMe, managerTeam]);

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
      queue_department: "",
    });
    localStorage.removeItem(FORM_DRAFT_KEY);
  }

  function openCreateModal() {
    setEditingTask(null);
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
      queue_department: task.queue_department || "",
    });
    setEditingTask(task);
    setTaskModalOpen(true);
  }

  async function refreshTasks() {
    const [todoRes, shareRes] = await Promise.all([
      fetch("/api/todos", { cache: "no-store" }),
      fetch(`/api/todos/shares?shared_with=${encodeURIComponent(me)}`, { cache: "no-store" }),
    ]);

    const todoJson = await todoRes.json();
    const shareJson = await shareRes.json();

    setTasks(Array.isArray(todoJson) ? todoJson : []);
    setSharedTaskIds(new Set(Array.isArray(shareJson) ? shareJson.map((s: TodoShare) => s.todo_id) : []));
  }

  async function submitTask() {
    if (!form.title.trim()) {
      alert("Task subject is required");
      return;
    }

    if (!form.due_date) {
      alert("Due date is required");
      return;
    }

    const due = new Date(form.due_date);
    if (Number.isNaN(due.getTime())) {
      alert("Please enter a valid due date");
      return;
    }

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      our_goal: form.our_goal.trim() || null,
      notes: form.notes.trim() || null,
      priority: form.priority,
      due_date: due.toISOString(),
      app_name: form.app_name.trim() || null,
      package_name: form.package_name.trim() || null,
      kpi_type: form.kpi_type.trim() || null,
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
        alert("Please choose a manager");
        return;
      }
      payload.assigned_to = form.assigned_to;
      payload.manager_id = form.assigned_to;
      payload.queue_department = null;
      payload.queue_status = null;
    }

    if (form.route_mode === "department") {
      if (!form.queue_department.trim()) {
        alert("Please enter queue department");
        return;
      }
      payload.assigned_to = null;
      payload.manager_id = null;
      payload.queue_department = form.queue_department.trim();
      payload.queue_status = "queued";
      payload.category = "department";
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

      await refreshTasks();
      setTaskModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

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
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Task Center</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Legacy workflow parity: quick filters, smart lists, list/kanban/calendar, routing, sharing, and approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => exportTasks("csv")}> <Download className="h-4 w-4" /> CSV </Button>
          <Button variant="outline" onClick={() => exportTasks("json")}> <Download className="h-4 w-4" /> JSON </Button>
          <Button onClick={openCreateModal}> <Plus className="h-4 w-4" /> New Task </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {kpis.map((k) => (
          <Card key={k.title} className="border-gray-200 dark:border-gray-700">
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

      <Card>
        <CardHeader className="flex flex-wrap items-center gap-3">
          <div className="min-w-[220px] flex-1">
            <Input
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title, app, package, assignee..."
            />
          </div>

          <div className="grid flex-[2] grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
            <Select
              label="Quick Filter"
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value as QuickFilter)}
              options={[
                { value: "my_pending", label: "My Pending" },
                { value: "my_all", label: "My All" },
                { value: "team_pending", label: "Team Pending" },
                { value: "team_all", label: "Team All" },
                { value: "all_pending", label: "All Pending" },
                { value: "all", label: "All Tasks" },
                { value: "approval_pending", label: "Approval Pending" },
                { value: "approval_all", label: "Approval Queue" },
              ]}
            />

            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "backlog", label: "Backlog" },
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "done", label: "Done" },
                { value: "pending_approval", label: "Pending Approval" },
              ]}
            />

            <Select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: "all", label: "All Priorities" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />

            <Select
              label="Date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              options={[
                { value: "all", label: "All Dates" },
                { value: "today", label: "Due Today" },
                { value: "overdue", label: "Overdue" },
                { value: "next7", label: "Next 7 Days" },
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
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "due_soon", label: "Due Soon" },
                { value: "priority", label: "Priority" },
              ]}
            />

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

        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 rounded border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900/20">
            {[
              { key: "my_pending", label: "My Pending" },
              { key: "my_all", label: "My All" },
              { key: "team_pending", label: "Team Pending" },
              { key: "team_all", label: "Team All" },
              { key: "all_pending", label: "All Pending" },
              { key: "approval_pending", label: "Approval Pending" },
            ].map((item) => {
              const key = item.key as QuickFilter;
              const active = quickFilter === key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setQuickFilter(key)}
                  className={`inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-semibold ${
                    active
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {item.label}
                  <span className="rounded bg-black/10 px-1.5 py-0.5">{quickFilterCounts[key]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded border border-dashed border-gray-300 p-2 text-xs dark:border-gray-700">
            <ListFilter className="h-4 w-4" />
            <span className="font-semibold">Smart Lists:</span>
            {[
              { key: "none", label: "None" },
              { key: "overdue", label: "Overdue" },
              { key: "due_today", label: "Due Today" },
              { key: "unassigned", label: "Unassigned" },
              { key: "queued", label: "Queued" },
              { key: "created_by_me", label: "Created By Me" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSmartList(item.key as SmartList)}
                className={`rounded px-2 py-1 ${
                  smartList === item.key
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
                    className="grid grid-cols-1 gap-2 rounded border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 lg:grid-cols-[28px_1fr_auto]"
                  >
                    <div className="pt-1">
                      <input type="checkbox" checked={selectedIds.has(task.id)} onChange={() => toggleSelected(task.id)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                        <Badge variant="outline">{task.task_status || "todo"}</Badge>
                        <Badge variant={task.priority === "high" ? "danger" : task.priority === "low" ? "info" : "warning"}>
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
                        <span>Due: {task.due_date ? formatDate(task.due_date) : "--"}</span>
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
                        <Button size="sm" variant="secondary" onClick={() => runTaskAction(task, "claim_queue")}>
                          Pick Queue
                        </Button>
                      )}

                      {(mine || isAdminLike(currentUser)) && task.task_status !== "in_progress" && !isDone(task) && (
                        <Button size="sm" variant="outline" onClick={() => runTaskAction(task, "start")}>
                          Start
                        </Button>
                      )}

                      {(mine || isAdminLike(currentUser)) && !isDone(task) && (
                        <Button size="sm" variant="success" onClick={() => runTaskAction(task, "submit")}>
                          Submit
                        </Button>
                      )}

                      {canApprove && (
                        <>
                          <Button size="sm" variant="success" onClick={() => runTaskAction(task, "approve")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => { setDeclineTask(task); setDeclineReason(task.decline_reason || ""); }}>
                            Decline
                          </Button>
                        </>
                      )}

                      {!isDone(task) && (
                        <Button size="sm" variant="outline" onClick={() => { setDelegateTask(task); setDelegateTarget(""); }}>
                          <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                      )}

                      {isDone(task) && (
                        <Button size="sm" variant="outline" onClick={() => runTaskAction(task, "reopen")}>
                          Reopen
                        </Button>
                      )}

                      <Button size="sm" variant="outline" onClick={() => setDetailTask(task)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(task)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShareTask(task)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => archiveTask(task.id)}>
                        <Columns3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { key: "backlog", label: "Backlog" },
                { key: "todo", label: "To Do" },
                { key: "in_progress", label: "In Progress" },
                { key: "done", label: "Done" },
              ].map((col) => {
                const colTasks = filteredTasks.filter((t) => (t.task_status || "todo") === col.key);
                return (
                  <div key={col.key} className="rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/30">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{col.label}</p>
                      <Badge variant="outline">{colTasks.length}</Badge>
                    </div>

                    <div className="space-y-2">
                      {colTasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => setDetailTask(task)}
                          className="w-full rounded border border-gray-200 bg-white p-2 text-left hover:border-primary-400 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{task.title}</p>
                          <p className="mt-1 text-xs text-gray-500">{task.assigned_to || "Unassigned"}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant={task.priority === "high" ? "danger" : task.priority === "low" ? "info" : "warning"}>
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
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => !!t.due_date)
                .sort((a, b) => new Date(a.due_date || "").getTime() - new Date(b.due_date || "").getTime())
                .map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 dark:border-gray-700">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.assigned_to || "Unassigned"} • {task.task_status || "todo"}</p>
                    </div>
                    <Badge variant="outline">{task.due_date ? formatDate(task.due_date) : "-"}</Badge>
                  </div>
                ))}

              {filteredTasks.filter((t) => !!t.due_date).length === 0 && (
                <div className="rounded border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
                  Calendar view has no due dates for current filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          if (!editingTask) resetForm();
        }}
        title={editingTask ? "Edit Task" : "Create Task"}
        size="xl"
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Task Subject" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskForm["priority"] }))}
            options={[
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />

          <div className="md:col-span-2">
            <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="md:col-span-2">
            <Input label="Our Goal" value={form.our_goal} onChange={(e) => setForm((p) => ({ ...p, our_goal: e.target.value }))} />
          </div>

          <Input label="Due Date" type="datetime-local" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
          <Input label="KPI" value={form.kpi_type} onChange={(e) => setForm((p) => ({ ...p, kpi_type: e.target.value }))} />

          <Input label="App Name" value={form.app_name} onChange={(e) => setForm((p) => ({ ...p, app_name: e.target.value }))} />
          <Input label="Package" value={form.package_name} onChange={(e) => setForm((p) => ({ ...p, package_name: e.target.value }))} />

          <div className="md:col-span-2">
            <Input label="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>

        <div className="mt-4 rounded border border-gray-200 p-3 dark:border-gray-700">
          <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Routing</p>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { key: "self", label: "Self/User" },
              { key: "department", label: "Department Queue" },
              { key: "manager", label: "Manager" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setForm((p) => ({ ...p, route_mode: opt.key as TaskForm["route_mode"] }))}
                className={`rounded border p-3 text-left text-sm ${
                  form.route_mode === opt.key
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                <p className="font-semibold">{opt.label}</p>
              </button>
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
    </div>
  );
}
