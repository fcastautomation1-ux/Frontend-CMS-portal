"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Play,
  Plus,
  Share2,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SearchBar } from "@/components/ui/search-bar";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAppStore } from "@/store";
import { formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import type { TodoPriority, TodoStatus } from "@/types";

type UserRow = {
  username: string;
  role: string;
  department: string | null;
  manager_id: string | null;
  team_members: string | null;
};

type TodoRow = {
  id: string;
  title: string;
  description: string | null;
  username: string;
  assigned_to: string | null;
  manager_id: string | null;
  status: TodoStatus;
  task_status: string | null;
  approval_status: string | null;
  completed: boolean | null;
  priority: TodoPriority;
  due_date: string | null;
  expected_due_date: string | null;
  actual_due_date: string | null;
  category: string | null;
  tags: string | null;
  notes: string | null;
  our_goal: string | null;
  kpi_type: string | null;
  queue_department: string | null;
  queue_status: string | null;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  completed_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  declined_by: string | null;
  declined_at: string | null;
  decline_reason: string | null;
};

type TodoShareRow = {
  id: string;
  todo_id: string;
  shared_by: string;
  shared_with: string;
  can_edit: boolean;
  created_at: string;
};

type TaskTab = "my" | "assigned" | "team" | "shared" | "all";

type TaskForm = {
  title: string;
  description: string;
  priority: TodoPriority;
  due_date: string;
  expected_due_date: string;
  assigned_to: string;
  category: string;
  tags: string;
  notes: string;
  our_goal: string;
  kpi_type: string;
  queue_department: string;
};

const defaultForm: TaskForm = {
  title: "",
  description: "",
  priority: "medium",
  due_date: "",
  expected_due_date: "",
  assigned_to: "",
  category: "",
  tags: "",
  notes: "",
  our_goal: "",
  kpi_type: "",
  queue_department: "",
};

const statusFilterOptions = [
  { value: "", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "completed", label: "Completed" },
];

const priorityFilterOptions = [
  { value: "", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function parseCsv(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function isInManagerList(managerField: string | null | undefined, username: string): boolean {
  if (!managerField) return false;
  const me = username.toLowerCase();
  return parseCsv(managerField).some((m) => m.toLowerCase() === me);
}

function isDoneTask(task: TodoRow): boolean {
  return (
    task.completed === true ||
    task.task_status === "done" ||
    task.approval_status === "approved" ||
    task.status === "completed"
  );
}

function getUnifiedStatus(task: TodoRow): string {
  if (task.approval_status === "pending_approval") return "pending_approval";
  if (task.approval_status === "approved") return "approved";
  if (task.approval_status === "declined") return "declined";
  if (task.task_status === "in_progress") return "in_progress";
  if (isDoneTask(task)) return "completed";
  return task.status || "open";
}

function isOverdue(task: TodoRow): boolean {
  if (!task.due_date || isDoneTask(task)) return false;
  return new Date(task.due_date).getTime() < Date.now();
}

function statusBadgeVariant(status: string): "default" | "success" | "warning" | "danger" | "info" | "outline" {
  if (status === "completed" || status === "approved") return "success";
  if (status === "pending_approval") return "warning";
  if (status === "declined") return "danger";
  if (status === "in_progress") return "info";
  return "default";
}

function priorityBadgeVariant(priority: string): "default" | "success" | "warning" | "danger" | "info" | "outline" {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  return "default";
}

export default function TasksPage() {
  const currentUser = useAppStore((s) => s.user);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [shares, setShares] = useState<TodoShareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TaskTab>("my");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TaskForm>(defaultForm);
  const [saving, setSaving] = useState(false);

  const [detailTask, setDetailTask] = useState<TodoRow | null>(null);
  const [deleteTask, setDeleteTask] = useState<TodoRow | null>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTask, setShareTask] = useState<TodoRow | null>(null);
  const [shareUsername, setShareUsername] = useState("");
  const [shareCanEdit, setShareCanEdit] = useState(false);

  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineTask, setDeclineTask] = useState<TodoRow | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const me = (currentUser?.username || "").toLowerCase();
  const isAdminOrSuper = currentUser?.username === "admin" || currentUser?.role === "Admin" || currentUser?.role === "Super Manager";
  const isManager = currentUser?.role === "Manager";

  const explicitTeamMembers = useMemo(() => {
    return parseCsv(currentUser?.teamMembers).map((u) => u.toLowerCase());
  }, [currentUser?.teamMembers]);

  const reverseTeamMembers = useMemo(() => {
    if (!currentUser?.username) return [];
    const meName = currentUser.username;
    return users
      .filter((u) => isInManagerList(u.manager_id, meName))
      .map((u) => (u.username || "").toLowerCase());
  }, [users, currentUser?.username]);

  const teamSet = useMemo(() => {
    return new Set([...explicitTeamMembers, ...reverseTeamMembers]);
  }, [explicitTeamMembers, reverseTeamMembers]);

  const sharesForMe = useMemo(() => {
    return shares.filter((s) => (s.shared_with || "").toLowerCase() === me);
  }, [shares, me]);

  const shareMapByTodo = useMemo(() => {
    const map = new Map<string, TodoShareRow[]>();
    shares.forEach((s) => {
      const list = map.get(s.todo_id) || [];
      list.push(s);
      map.set(s.todo_id, list);
    });
    return map;
  }, [shares]);

  const canViewTask = useCallback((task: TodoRow) => {
    const owner = (task.username || "").toLowerCase();
    const assignee = (task.assigned_to || "").toLowerCase();
    const completedBy = (task.completed_by || "").toLowerCase();

    if (isAdminOrSuper) return true;
    if (owner === me || assignee === me || completedBy === me) return true;
    if (isInManagerList(task.manager_id, currentUser?.username || "")) return true;

    const shared = shareMapByTodo.get(task.id) || [];
    if (shared.some((s) => (s.shared_with || "").toLowerCase() === me)) return true;

    if (isManager && (teamSet.has(owner) || teamSet.has(assignee))) return true;

    return false;
  }, [currentUser?.username, isAdminOrSuper, isManager, me, shareMapByTodo, teamSet]);

  const canEditTask = useCallback((task: TodoRow) => {
    const owner = (task.username || "").toLowerCase();
    if (isAdminOrSuper || owner === me) return true;

    const shared = shareMapByTodo.get(task.id) || [];
    if (shared.some((s) => (s.shared_with || "").toLowerCase() === me && s.can_edit)) return true;

    if (isManager) {
      const assignee = (task.assigned_to || "").toLowerCase();
      if (teamSet.has(assignee) || teamSet.has(owner)) return true;
      if (isInManagerList(task.manager_id, currentUser?.username || "")) return true;
    }

    return false;
  }, [currentUser?.username, isAdminOrSuper, isManager, me, shareMapByTodo, teamSet]);

  const canDeleteTask = useCallback((task: TodoRow) => {
    const owner = (task.username || "").toLowerCase();
    if (isAdminOrSuper) return true;
    return owner === me;
  }, [isAdminOrSuper, me]);

  const loadAll = useCallback(async () => {
    if (!currentUser?.username) return;
    setLoading(true);
    try {
      const [usersRes, todosRes, sharesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/todos"),
        fetch("/api/todos/shares"),
      ]);

      const [usersData, todosData, sharesData] = await Promise.all([
        usersRes.json(),
        todosRes.json(),
        sharesRes.json(),
      ]);

      if (!usersRes.ok) throw new Error(usersData?.error || "Failed to load users");
      if (!todosRes.ok) throw new Error(todosData?.error || "Failed to load todos");
      if (!sharesRes.ok) throw new Error(sharesData?.error || "Failed to load shares");

      setUsers(usersData || []);
      setTodos((todosData || []).filter((t: TodoRow) => !!t.id));
      setShares(sharesData || []);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to load tasks module data");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.username]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const visibleTodos = useMemo(() => {
    const scoped = todos.filter((t) => canViewTask(t));

    if (tab === "my") return scoped.filter((t) => (t.username || "").toLowerCase() === me);
    if (tab === "assigned") return scoped.filter((t) => (t.assigned_to || "").toLowerCase() === me);
    if (tab === "team") return scoped.filter((t) => {
      const owner = (t.username || "").toLowerCase();
      const assignee = (t.assigned_to || "").toLowerCase();
      return teamSet.has(owner) || teamSet.has(assignee) || isInManagerList(t.manager_id, currentUser?.username || "");
    });
    if (tab === "shared") {
      const sharedIds = new Set(sharesForMe.map((s) => s.todo_id));
      return scoped.filter((t) => sharedIds.has(t.id));
    }

    return isAdminOrSuper || isManager ? scoped : scoped.filter((t) => (t.username || "").toLowerCase() === me);
  }, [todos, tab, canViewTask, me, teamSet, sharesForMe, isAdminOrSuper, isManager, currentUser?.username]);

  const filteredTodos = useMemo(() => {
    return visibleTodos.filter((t) => {
      const status = getUnifiedStatus(t);
      const searchMatch = !search || [t.title, t.description, t.category, t.tags, t.username, t.assigned_to].join(" ").toLowerCase().includes(search.toLowerCase());
      const statusMatch = !statusFilter || status === statusFilter;
      const priorityMatch = !priorityFilter || t.priority === priorityFilter;
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [visibleTodos, search, statusFilter, priorityFilter]);

  const tabCounts = useMemo(() => {
    const scoped = todos.filter((t) => canViewTask(t));
    return {
      my: scoped.filter((t) => (t.username || "").toLowerCase() === me).length,
      assigned: scoped.filter((t) => (t.assigned_to || "").toLowerCase() === me).length,
      team: scoped.filter((t) => {
        const owner = (t.username || "").toLowerCase();
        const assignee = (t.assigned_to || "").toLowerCase();
        return teamSet.has(owner) || teamSet.has(assignee) || isInManagerList(t.manager_id, currentUser?.username || "");
      }).length,
      shared: scoped.filter((t) => sharesForMe.some((s) => s.todo_id === t.id)).length,
      all: scoped.length,
    };
  }, [todos, canViewTask, me, teamSet, currentUser?.username, sharesForMe]);

  const openCreate = () => {
    setEditTaskId(null);
    setFormData(defaultForm);
    setFormOpen(true);
  };

  const openEdit = (task: TodoRow) => {
    if (!canEditTask(task)) {
      toast("error", "You do not have permission to edit this task");
      return;
    }

    setEditTaskId(task.id);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      due_date: task.due_date ? task.due_date.slice(0, 10) : "",
      expected_due_date: task.expected_due_date ? task.expected_due_date.slice(0, 10) : "",
      assigned_to: task.assigned_to || "",
      category: task.category || "",
      tags: task.tags || "",
      notes: task.notes || "",
      our_goal: task.our_goal || "",
      kpi_type: task.kpi_type || "",
      queue_department: task.queue_department || "",
    });
    setFormOpen(true);
  };

  const saveTask = async () => {
    if (!currentUser?.username) return;
    if (!formData.title.trim()) {
      toast("error", "Task title is required");
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: Partial<TodoRow> & { title: string } = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        due_date: formData.due_date || null,
        expected_due_date: formData.expected_due_date || null,
        assigned_to: formData.assigned_to || null,
        category: formData.category.trim() || null,
        tags: formData.tags.trim() || null,
        notes: formData.notes.trim() || null,
        our_goal: formData.our_goal.trim() || null,
        kpi_type: formData.kpi_type.trim() || null,
        queue_department: formData.queue_department.trim() || null,
        updated_at: now,
      };

      if (!editTaskId) {
        Object.assign(payload, {
          username: currentUser.username,
          status: "open",
          task_status: formData.assigned_to ? "backlog" : "todo",
          completed: false,
          approval_status: "approved",
          created_at: now,
          manager_id: null,
          queue_status: formData.queue_department ? "queued" : null,
        });
      }

      if (formData.assigned_to) {
        const assignee = users.find((u) => u.username === formData.assigned_to);
        Object.assign(payload, {
          manager_id: assignee?.manager_id || null,
          queue_status: null,
        });
      }

      if (editTaskId) {
        const original = todos.find((t) => t.id === editTaskId);
        if (!original || !canEditTask(original)) {
          throw new Error("You do not have permission to edit this task");
        }

        const res = await fetch("/api/todos", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editTaskId, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to update task");
        toast("success", "Task updated");
      } else {
        const res = await fetch("/api/todos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to create task");
        toast("success", "Task created");
      }

      setFormOpen(false);
      await loadAll();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  const removeTask = async () => {
    if (!deleteTask) return;
    if (!canDeleteTask(deleteTask)) {
      toast("error", "You do not have permission to delete this task");
      return;
    }

    try {
      const res = await fetch(`/api/todos?id=${encodeURIComponent(deleteTask.id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete task");

      toast("success", "Task deleted");
      setDeleteTask(null);
      setDetailTask(null);
      await loadAll();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Delete failed");
    }
  };

  const updateTaskWorkflow = async (task: TodoRow, mode: "start" | "submit" | "approve" | "decline" | "reopen") => {
    if (!currentUser?.username) return;

    const isOwner = (task.username || "").toLowerCase() === me;
    const isAssignee = (task.assigned_to || "").toLowerCase() === me;

    let patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (mode === "start") {
      if (!isAssignee && !isOwner && !isAdminOrSuper) {
        toast("error", "Only assignee can start this task");
        return;
      }
      patch = {
        ...patch,
        task_status: "in_progress",
        status: "in-progress",
      };
    }

    if (mode === "submit") {
      if (!isAssignee && !isOwner && !isAdminOrSuper) {
        toast("error", "Only assignee can submit completion");
        return;
      }

      if (isOwner || isAdminOrSuper) {
        patch = {
          ...patch,
          completed: true,
          completed_at: new Date().toISOString(),
          completed_by: currentUser.username,
          approval_status: "approved",
          task_status: "done",
          status: "completed",
        };
      } else {
        patch = {
          ...patch,
          completed: false,
          completed_by: currentUser.username,
          approval_status: "pending_approval",
          task_status: "in_progress",
          status: "pending",
        };
      }
    }

    if (mode === "approve") {
      if (!isOwner && !isAdminOrSuper) {
        toast("error", "Only creator can approve completion");
        return;
      }
      patch = {
        ...patch,
        completed: true,
        completed_at: new Date().toISOString(),
        approval_status: "approved",
        approved_by: currentUser.username,
        approved_at: new Date().toISOString(),
        task_status: "done",
        status: "completed",
      };
    }

    if (mode === "decline") {
      if (!isOwner && !isAdminOrSuper) {
        toast("error", "Only creator can decline completion");
        return;
      }
      setDeclineTask(task);
      setDeclineReason("");
      setDeclineModalOpen(true);
      return;
    }

    if (mode === "reopen") {
      if (!isOwner && !isAdminOrSuper) {
        toast("error", "Only creator can reopen task");
        return;
      }
      patch = {
        ...patch,
        completed: false,
        completed_at: null,
        completed_by: null,
        approval_status: "approved",
        task_status: "in_progress",
        status: "open",
      };
    }

    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update task workflow");
      toast("success", "Task updated");
      await loadAll();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Task workflow update failed");
    }
  };

  const submitDecline = async () => {
    if (!declineTask || !currentUser?.username) return;
    try {
      const patch = {
        id: declineTask.id,
        completed: false,
        approval_status: "declined",
        declined_by: currentUser.username,
        declined_at: new Date().toISOString(),
        decline_reason: declineReason.trim() || null,
        task_status: "in_progress",
        status: "declined",
        updated_at: new Date().toISOString(),
      };

      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Decline failed");

      toast("success", "Completion declined");
      setDeclineModalOpen(false);
      setDeclineTask(null);
      setDeclineReason("");
      await loadAll();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Decline failed");
    }
  };

  const openShareModal = async (task: TodoRow) => {
    if (!canEditTask(task)) {
      toast("error", "Only task owner/editor can share this task");
      return;
    }
    setShareTask(task);
    setShareUsername("");
    setShareCanEdit(false);
    setShareModalOpen(true);
  };

  const shareTaskWithUser = async () => {
    if (!shareTask || !shareUsername.trim() || !currentUser?.username) return;

    try {
      const res = await fetch("/api/todos/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          todo_id: shareTask.id,
          shared_by: currentUser.username,
          shared_with: shareUsername.trim(),
          can_edit: shareCanEdit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Share failed");

      toast("success", `Task shared with ${shareUsername}`);
      setShareUsername("");
      await loadAll();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Share failed");
    }
  };

  const removeShare = async (shareId: string) => {
    try {
      const res = await fetch(`/api/todos/shares?id=${encodeURIComponent(shareId)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to remove share");
      toast("success", "Share removed");
      await loadAll();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to remove share");
    }
  };

  const shareOptions = useMemo(() => {
    return users
      .filter((u) => (u.username || "").toLowerCase() !== me)
      .map((u) => ({ value: u.username, label: `${u.username} (${u.role})` }));
  }, [users, me]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Tasks</h1>
        <Card className="p-6"><TableSkeleton rows={8} cols={6} /></Card>
      </div>
    );
  }

  const tabs: Array<{ key: TaskTab; label: string; count: number; show: boolean }> = [
    { key: "my", label: "My Tasks", count: tabCounts.my, show: true },
    { key: "assigned", label: "Assigned To Me", count: tabCounts.assigned, show: true },
    { key: "team", label: "Team", count: tabCounts.team, show: isManager || isAdminOrSuper },
    { key: "shared", label: "Shared", count: tabCounts.shared, show: true },
    { key: "all", label: "All", count: tabCounts.all, show: isManager || isAdminOrSuper },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-white to-cyan-50 p-5 dark:border-gray-700 dark:from-gray-900 dark:to-cyan-950/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Tasks Module</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full workflow: assign, start, submit, approve/decline, share, and track task ownership.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              tab === t.key ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search task title, tags, category, user..." className="flex-1" />
        <Select options={statusFilterOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48" />
        <Select options={priorityFilterOptions} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-40" />
      </div>

      <div className="space-y-3">
        {filteredTodos.map((task) => {
          const unifiedStatus = getUnifiedStatus(task);
          const overdue = isOverdue(task);
          const owner = (task.username || "").toLowerCase() === me;
          const assignee = (task.assigned_to || "").toLowerCase() === me;
          const pendingApproval = task.approval_status === "pending_approval";

          return (
            <Card key={task.id} className="group transition-shadow hover:shadow-elevation-2">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`truncate text-sm font-semibold ${isDoneTask(task) ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}`}>
                        {task.title}
                      </h3>
                      {overdue && <Badge variant="danger">Overdue</Badge>}
                    </div>
                    {task.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusBadgeVariant(unifiedStatus)}>{unifiedStatus}</Badge>
                      <Badge variant={priorityBadgeVariant(task.priority)}>{task.priority || "low"}</Badge>
                      {task.due_date && (
                        <span className={`flex items-center gap-1 text-xs ${overdue ? "font-semibold text-red-500" : "text-gray-500"}`}>
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <UserCheck className="h-3 w-3" />
                        {task.assigned_to || "Unassigned"}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(task.updated_at || task.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    {assignee && !isDoneTask(task) && unifiedStatus !== "in_progress" && (
                      <Button variant="ghost" size="icon-sm" onClick={() => updateTaskWorkflow(task, "start")} title="Start">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {(assignee || owner || isAdminOrSuper) && !isDoneTask(task) && (
                      <Button variant="ghost" size="icon-sm" onClick={() => updateTaskWorkflow(task, "submit")} title="Submit Completion">
                        <ClipboardCheck className="h-4 w-4" />
                      </Button>
                    )}
                    {(owner || isAdminOrSuper) && pendingApproval && (
                      <>
                        <Button variant="ghost" size="icon-sm" onClick={() => updateTaskWorkflow(task, "approve")} title="Approve">
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => updateTaskWorkflow(task, "decline")} title="Decline">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {(owner || isAdminOrSuper) && isDoneTask(task) && (
                      <Button variant="ghost" size="icon-sm" onClick={() => updateTaskWorkflow(task, "reopen")} title="Reopen">
                        <Clock3 className="h-4 w-4" />
                      </Button>
                    )}
                    {canEditTask(task) && (
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(task)} title="Edit">
                        <Users className="h-4 w-4" />
                      </Button>
                    )}
                    {canEditTask(task) && (
                      <Button variant="ghost" size="icon-sm" onClick={() => openShareModal(task)} title="Share">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteTask(task) && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTask(task)} className="text-red-500" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800">
                  <span>Owner: <strong>{task.username}</strong></span>
                  <span>Created: {formatDateTime(task.created_at)}</span>
                  {task.completed_by && <span>Completed by: <strong>{task.completed_by}</strong></span>}
                  {task.approved_by && <span>Approved by: <strong>{task.approved_by}</strong></span>}
                  {task.declined_by && <span>Declined by: <strong>{task.declined_by}</strong></span>}
                </div>
              </div>
            </Card>
          );
        })}

        {filteredTodos.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm text-gray-500">No tasks found in this view</p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Create Task
            </Button>
          </div>
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editTaskId ? "Edit Task" : "New Task"} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
              autoFocus
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <Select
            label="Priority"
            options={priorityFilterOptions.filter((p) => p.value)}
            value={formData.priority}
            onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as TodoPriority }))}
          />
          <Select
            label="Assign To"
            options={[{ value: "", label: "Unassigned" }, ...users.map((u) => ({ value: u.username, label: `${u.username} (${u.role})` }))]}
            value={formData.assigned_to}
            onChange={(e) => setFormData((prev) => ({ ...prev, assigned_to: e.target.value }))}
          />

          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
          />
          <Input
            label="Expected Due Date"
            type="date"
            value={formData.expected_due_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, expected_due_date: e.target.value }))}
          />

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            placeholder="Marketing / Design / QA"
          />
          <Input
            label="KPI Type"
            value={formData.kpi_type}
            onChange={(e) => setFormData((prev) => ({ ...prev, kpi_type: e.target.value }))}
            placeholder="Performance KPI"
          />

          <div className="sm:col-span-2">
            <Input
              label="Tags"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="Comma separated tags"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Queue Department"
              value={formData.queue_department}
              onChange={(e) => setFormData((prev) => ({ ...prev, queue_department: e.target.value }))}
              placeholder="Department queue (optional)"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Our Goal</label>
            <textarea
              rows={3}
              value={formData.our_goal}
              onChange={(e) => setFormData((prev) => ({ ...prev, our_goal: e.target.value }))}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={saveTask} loading={saving}>{editTaskId ? "Save Changes" : "Create Task"}</Button>
        </div>
      </Modal>

      <Modal open={!!detailTask} onClose={() => setDetailTask(null)} title="Task Details" size="lg">
        {detailTask && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{detailTask.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{detailTask.description || "No description"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><span className="text-xs font-semibold text-gray-500">Status</span><div className="mt-1"><Badge variant={statusBadgeVariant(getUnifiedStatus(detailTask))}>{getUnifiedStatus(detailTask)}</Badge></div></div>
              <div><span className="text-xs font-semibold text-gray-500">Priority</span><div className="mt-1"><Badge variant={priorityBadgeVariant(detailTask.priority)}>{detailTask.priority}</Badge></div></div>
              <div><span className="text-xs font-semibold text-gray-500">Created By</span><p className="mt-1 text-sm">{detailTask.username}</p></div>
              <div><span className="text-xs font-semibold text-gray-500">Assigned To</span><p className="mt-1 text-sm">{detailTask.assigned_to || "Unassigned"}</p></div>
              <div><span className="text-xs font-semibold text-gray-500">Due Date</span><p className="mt-1 text-sm">{detailTask.due_date ? formatDate(detailTask.due_date) : "No due date"}</p></div>
              <div><span className="text-xs font-semibold text-gray-500">Created</span><p className="mt-1 text-sm">{formatDateTime(detailTask.created_at)}</p></div>
            </div>
            {detailTask.our_goal && <div><span className="text-xs font-semibold text-gray-500">Our Goal</span><p className="mt-1 text-sm">{detailTask.our_goal}</p></div>}
            {detailTask.notes && <div><span className="text-xs font-semibold text-gray-500">Notes</span><p className="mt-1 text-sm">{detailTask.notes}</p></div>}
          </div>
        )}
      </Modal>

      <Modal open={shareModalOpen} onClose={() => setShareModalOpen(false)} title={`Share Task: ${shareTask?.title || ""}`}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select
              options={[{ value: "", label: "Select user..." }, ...shareOptions]}
              value={shareUsername}
              onChange={(e) => setShareUsername(e.target.value)}
              className="flex-1"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <input type="checkbox" checked={shareCanEdit} onChange={(e) => setShareCanEdit(e.target.checked)} className="rounded border-gray-300" />
              Can Edit
            </label>
            <Button onClick={shareTaskWithUser} disabled={!shareUsername}>Share</Button>
          </div>

          {shareTask && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Current Shares</h4>
              <div className="space-y-2">
                {(shareMapByTodo.get(shareTask.id) || []).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Avatar name={s.shared_with} size="sm" />
                      <span className="text-sm">{s.shared_with}</span>
                      {s.can_edit && <Badge variant="info">Can Edit</Badge>}
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => removeShare(s.id)} className="text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {(shareMapByTodo.get(shareTask.id) || []).length === 0 && (
                  <p className="text-sm text-gray-500">No shares yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={!!deleteTask} onClose={() => setDeleteTask(null)} title="Delete Task" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delete <strong>{deleteTask?.title}</strong>? This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTask(null)}>Cancel</Button>
          <Button variant="danger" onClick={removeTask}>Delete</Button>
        </div>
      </Modal>

      <Modal open={declineModalOpen} onClose={() => setDeclineModalOpen(false)} title="Decline Completion" size="sm">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Reason (optional)</label>
          <textarea
            rows={4}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeclineModalOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={submitDecline}>Decline</Button>
        </div>
      </Modal>
    </div>
  );
}
