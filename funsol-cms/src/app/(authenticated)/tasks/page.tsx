"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Share2,
  Calendar,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/avatar";
import { SearchBar } from "@/components/ui/search-bar";
import { TableSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAppStore } from "@/store";
import { supabase } from "@/lib/supabase";
import {
  cn,
  formatDate,
  formatDateTime,
  timeAgo,
  getStatusColor,
  getPriorityColor,
} from "@/lib/utils";
import type { TodoStatus, TodoPriority } from "@/types";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "pending", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "completed", label: "Completed" },
];

const priorityOptions = [
  { value: "", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const defaultForm = {
  title: "",
  description: "",
  status: "open" as TodoStatus,
  priority: "medium" as TodoPriority,
  due_date: "",
  assigned_to: "",
  category: "",
  tags: "",
};

export default function TasksPage() {
  const user = useAppStore((s) => s.user);
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [tab, setTab] = useState<"my" | "assigned" | "shared" | "all">("my");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [detailTask, setDetailTask] = useState<any>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUsername, setShareUsername] = useState("");
  const [shareCanEdit, setShareCanEdit] = useState(false);
  const [shares, setShares] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const isAdmin = user?.role === "Admin" || user?.username === "admin";
  const isManager = user?.role === "Manager" || user?.role === "Super Manager" || isAdmin;

  const loadTodos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch {
      toast("error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
    // Load users for assignment
    supabase.from("users").select("username,role,department").then(({ data }) => setUsers(data || []));
  }, [loadTodos]);

  // Filter todos based on tab
  const getTabTodos = () => {
    const username = user?.username?.toLowerCase();
    switch (tab) {
      case "my":
        return todos.filter((t) => t.username?.toLowerCase() === username);
      case "assigned":
        return todos.filter(
          (t) =>
            t.assigned_to?.toLowerCase() === username ||
            t.assigned_to?.toLowerCase().split(",").map((s: string) => s.trim()).includes(username)
        );
      case "shared":
        // Will be enhanced with todo_shares table
        return todos.filter((t) => t.username?.toLowerCase() !== username);
      case "all":
        return todos;
      default:
        return todos;
    }
  };

  const filteredTodos = getTabTodos().filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const openCreate = () => {
    setFormData(defaultForm);
    setEditMode(false);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (todo: any) => {
    setFormData({
      title: todo.title,
      description: todo.description || "",
      status: todo.status,
      priority: todo.priority,
      due_date: todo.due_date ? todo.due_date.split("T")[0] : "",
      assigned_to: todo.assigned_to || "",
      category: todo.category || "",
      tags: todo.tags || "",
    });
    setEditMode(true);
    setEditingId(todo.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast("error", "Task title is required");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null,
        category: formData.category || null,
        tags: formData.tags || null,
        updated_at: new Date().toISOString(),
      };

      if (editMode && editingId) {
        const { error } = await supabase.from("todos").update(payload).eq("id", editingId);
        if (error) throw error;
        toast("success", "Task updated");
      } else {
        payload.username = user?.username;
        payload.created_at = new Date().toISOString();
        const { error } = await supabase.from("todos").insert(payload);
        if (error) throw error;
        toast("success", "Task created");
      }
      setModalOpen(false);
      loadTodos();
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { error } = await supabase.from("todos").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      toast("success", "Task deleted");
      setDeleteConfirm(null);
      loadTodos();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const handleStatusChange = async (todoId: string, newStatus: TodoStatus) => {
    try {
      const payload: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === "completed") payload.completed_at = new Date().toISOString();
      const { error } = await supabase.from("todos").update(payload).eq("id", todoId);
      if (error) throw error;
      toast("success", `Status updated to ${newStatus}`);
      loadTodos();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const openShare = async (todo: any) => {
    setDetailTask(todo);
    setShareModalOpen(true);
    setShareUsername("");
    setShareCanEdit(false);
    // Load shares for this todo
    const { data } = await supabase.from("todo_shares").select("*").eq("todo_id", todo.id);
    setShares(data || []);
  };

  const handleShare = async () => {
    if (!shareUsername.trim() || !detailTask) return;
    try {
      const { error } = await supabase.from("todo_shares").insert({
        todo_id: detailTask.id,
        shared_by: user?.username,
        shared_with: shareUsername.trim(),
        can_edit: shareCanEdit,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast("success", `Shared with ${shareUsername}`);
      setShareUsername("");
      const { data } = await supabase.from("todo_shares").select("*").eq("todo_id", detailTask.id);
      setShares(data || []);
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const handleUnshare = async (shareId: string) => {
    try {
      await supabase.from("todo_shares").delete().eq("id", shareId);
      toast("success", "Share removed");
      if (detailTask) {
        const { data } = await supabase.from("todo_shares").select("*").eq("todo_id", detailTask.id);
        setShares(data || []);
      }
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const tabs = [
    { key: "my", label: "My Tasks", count: todos.filter((t) => t.username?.toLowerCase() === user?.username?.toLowerCase()).length },
    { key: "assigned", label: "Assigned to Me", count: todos.filter((t) => t.assigned_to?.toLowerCase()?.includes(user?.username?.toLowerCase() || "xxx")).length },
    { key: "shared", label: "Shared", count: 0 },
    ...(isManager ? [{ key: "all", label: "All Tasks", count: todos.length }] : []),
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Tasks</h1>
        <Card className="p-6"><TableSkeleton rows={8} cols={5} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Tasks</h1>
          <p className="text-sm text-gray-500">Manage and track your tasks</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary-500 text-primary-500"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            {t.label}
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs",
              tab === t.key ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." className="flex-1 max-w-md" />
        <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44" />
        <Select options={priorityOptions} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-40" />
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTodos.map((todo) => (
          <Card key={todo.id} className="group transition-shadow hover:shadow-elevation-2">
            <div className="flex items-start gap-4 p-4">
              {/* Status indicator */}
              <button
                onClick={() =>
                  handleStatusChange(
                    todo.id,
                    todo.status === "completed" ? "open" : "completed"
                  )
                }
                className="mt-0.5 shrink-0"
              >
                <CheckCircle
                  className={cn(
                    "h-5 w-5 transition-colors",
                    todo.status === "completed"
                      ? "fill-green-500 text-green-500"
                      : "text-gray-300 hover:text-green-400 dark:text-gray-600"
                  )}
                />
              </button>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className={cn(
                        "text-sm font-semibold cursor-pointer hover:text-primary-500",
                        todo.status === "completed" ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"
                      )}
                      onClick={() => setDetailTask(todo)}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{todo.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(todo)} title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openShare(todo)} title="Share">
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteConfirm(todo)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge className={getStatusColor(todo.status)}>{todo.status}</Badge>
                  <Badge className={getPriorityColor(todo.priority)}>{todo.priority}</Badge>
                  {todo.due_date && (
                    <span className={cn(
                      "flex items-center gap-1 text-xs",
                      new Date(todo.due_date) < new Date() && todo.status !== "completed"
                        ? "text-red-500 font-semibold"
                        : "text-gray-500"
                    )}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(todo.due_date)}
                    </span>
                  )}
                  {todo.assigned_to && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Avatar name={todo.assigned_to} size="sm" className="h-4 w-4 text-[8px]" />
                      {todo.assigned_to}
                    </span>
                  )}
                  {todo.category && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Tag className="h-3 w-3" />
                      {todo.category}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{timeAgo(todo.created_at)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredTodos.length === 0 && (
          <div className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm text-gray-500">No tasks found</p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Create Your First Task
            </Button>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Edit Task" : "New Task"} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              autoFocus
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Task description..."
            />
          </div>
          <Select
            label="Status"
            options={statusOptions.filter((o) => o.value)}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TodoStatus })}
          />
          <Select
            label="Priority"
            options={priorityOptions.filter((o) => o.value)}
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TodoPriority })}
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
          <Select
            label="Assign To"
            options={[
              { value: "", label: "Unassigned" },
              ...users.map((u) => ({ value: u.username, label: `${u.username} (${u.role})` })),
            ]}
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g. Marketing, Bug Fix"
          />
          <Input
            label="Tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Comma-separated tags"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editMode ? "Save Changes" : "Create Task"}</Button>
        </div>
      </Modal>

      {/* Task Detail Modal */}
      <Modal open={!!detailTask && !shareModalOpen} onClose={() => setDetailTask(null)} title="Task Details" size="lg">
        {detailTask && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{detailTask.title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{detailTask.description || "No description"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-xs font-semibold text-gray-500">Status</span>
                <div className="mt-1"><Badge className={getStatusColor(detailTask.status)}>{detailTask.status}</Badge></div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Priority</span>
                <div className="mt-1"><Badge className={getPriorityColor(detailTask.priority)}>{detailTask.priority}</Badge></div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Created By</span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{detailTask.username}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Assigned To</span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{detailTask.assigned_to || "Unassigned"}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Due Date</span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{detailTask.due_date ? formatDate(detailTask.due_date) : "No due date"}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500">Created</span>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{formatDateTime(detailTask.created_at)}</p>
              </div>
            </div>
            {detailTask.category && (
              <div>
                <span className="text-xs font-semibold text-gray-500">Category</span>
                <p className="mt-1 text-sm">{detailTask.category}</p>
              </div>
            )}
            {detailTask.tags && (
              <div>
                <span className="text-xs font-semibold text-gray-500">Tags</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {detailTask.tags.split(",").map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag.trim()}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={() => { setDetailTask(null); openEdit(detailTask); }}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => openShare(detailTask)}>
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Share Modal */}
      <Modal open={shareModalOpen} onClose={() => setShareModalOpen(false)} title={`Share: ${detailTask?.title || ""}`}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select
              options={[
                { value: "", label: "Select user..." },
                ...users.filter((u) => u.username !== user?.username).map((u) => ({ value: u.username, label: u.username })),
              ]}
              value={shareUsername}
              onChange={(e) => setShareUsername(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <input checked={shareCanEdit} onChange={(e) => setShareCanEdit(e.target.checked)} type="checkbox" id="can-edit" className="rounded border-gray-300" />
              <label htmlFor="can-edit" className="text-sm text-gray-600 dark:text-gray-400">Can Edit</label>
            </div>
            <Button onClick={handleShare} disabled={!shareUsername}>Share</Button>
          </div>
          {shares.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Shared With</h4>
              <div className="space-y-2">
                {shares.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <Avatar name={s.shared_with} size="sm" />
                      <span className="text-sm text-gray-900 dark:text-white">{s.shared_with}</span>
                      {s.can_edit && <Badge variant="info">Can Edit</Badge>}
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleUnshare(s.id)} className="text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Task" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">Delete &quot;{deleteConfirm?.title}&quot;? This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete Task</Button>
        </div>
      </Modal>
    </div>
  );
}
