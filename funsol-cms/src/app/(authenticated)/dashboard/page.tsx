"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListChecks,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type ModuleAccess = {
  googleAccount?: {
    enabled?: boolean;
    accessLevel?: "all" | "specific";
    accounts?: string[];
  };
  users?: {
    enabled?: boolean;
    departmentRestricted?: boolean;
  };
};

type UserRow = {
  username: string;
  role: string;
  department: string | null;
  allowed_accounts: string | null;
  module_access: string | ModuleAccess | null;
  manager_id: string | null;
  team_members: string | null;
};

type AccountRow = {
  customer_id: string;
};

type TodoRow = {
  id: string;
  title: string;
  status: string | null;
  task_status: string | null;
  priority: string | null;
  assigned_to: string | null;
  username: string | null;
  manager_id: string | null;
  completed: boolean | null;
  approval_status: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string | null;
  completed_by: string | null;
};

type TodoShareRow = {
  todo_id: string;
};

type KPI = {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
};

function parseModuleAccess(raw: UserRow["module_access"]): ModuleAccess {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) as ModuleAccess;
  } catch {
    return {};
  }
}

function parseCsv(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function inManagerList(managerField: string | null | undefined, username: string): boolean {
  if (!managerField) return false;
  const me = username.trim().toLowerCase();
  return parseCsv(managerField).some((m) => m.toLowerCase() === me);
}

function isDone(todo: TodoRow): boolean {
  return (
    todo.completed === true ||
    todo.task_status === "done" ||
    todo.approval_status === "approved" ||
    todo.status === "completed"
  );
}

function isOverdue(todo: TodoRow): boolean {
  if (!todo.due_date || isDone(todo)) return false;
  return new Date(todo.due_date).getTime() < Date.now();
}

function isDueToday(todo: TodoRow): boolean {
  if (!todo.due_date || isDone(todo)) return false;
  const d = new Date(todo.due_date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function getVisibleTeamUsernames(currentUser: UserRow, allUsers: UserRow[]): Set<string> {
  const me = currentUser.username.toLowerCase();
  const visible = new Set<string>();

  // Explicit team members configured on manager row.
  parseCsv(currentUser.team_members).forEach((u) => visible.add(u.toLowerCase()));

  // Reverse lookup: users where manager_id contains current user.
  allUsers.forEach((u) => {
    if (inManagerList(u.manager_id, me)) {
      visible.add((u.username || "").toLowerCase());
    }
  });

  return visible;
}

function canSeeAccount(user: UserRow, customerId: string): boolean {
  if (user.username === "admin" || user.role === "Admin" || user.role === "Super Manager") return true;

  const mod = parseModuleAccess(user.module_access).googleAccount;
  if (user.role === "Manager") {
    if (!mod?.enabled) return false;
    if (mod.accessLevel === "all") return true;
    return (mod.accounts || []).map((x) => x.toLowerCase()).includes(customerId.toLowerCase());
  }

  const allowed = parseCsv(user.allowed_accounts).map((x) => x.toLowerCase());
  return allowed.includes("all") || allowed.includes("*") || allowed.includes(customerId.toLowerCase());
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserRow | null>(null);
  const [visibleTodos, setVisibleTodos] = useState<TodoRow[]>([]);
  const [visibleUsers, setVisibleUsers] = useState<UserRow[]>([]);
  const [visibleAccounts, setVisibleAccounts] = useState<AccountRow[]>([]);

  useEffect(() => {
    async function load() {
      const username = (session?.user as { username?: string } | undefined)?.username;
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        const [meRes, usersRes, todosRes, sharesRes, accountsRes] = await Promise.all([
          supabase
            .from("users")
            .select("username,role,department,allowed_accounts,module_access,manager_id,team_members")
            .eq("username", username)
            .single(),
          supabase
            .from("users")
            .select("username,role,department,allowed_accounts,module_access,manager_id,team_members")
            .order("username"),
          supabase
            .from("todos")
            .select("id,title,status,task_status,priority,assigned_to,username,manager_id,completed,approval_status,due_date,created_at,updated_at,completed_by"),
          supabase.from("todo_shares").select("todo_id").eq("shared_with", username),
          supabase.from("accounts").select("customer_id").order("customer_id"),
        ]);

        if (meRes.error) throw meRes.error;
        if (usersRes.error) throw usersRes.error;
        if (todosRes.error) throw todosRes.error;
        if (sharesRes.error) throw sharesRes.error;
        if (accountsRes.error) throw accountsRes.error;

        const me = meRes.data as UserRow;
        const allUsers = (usersRes.data || []) as UserRow[];
        const allTodos = (todosRes.data || []) as TodoRow[];
        const sharedIds = new Set((sharesRes.data || []).map((s: TodoShareRow) => s.todo_id));
        const allAccounts = (accountsRes.data || []) as AccountRow[];

        const meLower = me.username.toLowerCase();
        const isAdmin = me.username === "admin" || me.role === "Admin" || me.role === "Super Manager";
        const isManager = me.role === "Manager";
        const teamUsers = getVisibleTeamUsernames(me, allUsers);

        let usersScope: UserRow[] = [];
        if (isAdmin) {
          usersScope = allUsers;
        } else if (isManager) {
          const moduleUsers = parseModuleAccess(me.module_access).users;
          const deptRestricted = !!(moduleUsers?.enabled && moduleUsers.departmentRestricted !== false);
          const base = deptRestricted && me.department
            ? allUsers.filter((u) => (u.department || "").toLowerCase() === (me.department || "").toLowerCase())
            : allUsers;

          usersScope = base.filter((u) => {
            const uLower = (u.username || "").toLowerCase();
            return uLower === meLower || teamUsers.has(uLower) || inManagerList(u.manager_id, me.username);
          });

          if (!usersScope.find((u) => (u.username || "").toLowerCase() === meLower)) {
            const self = allUsers.find((u) => (u.username || "").toLowerCase() === meLower);
            if (self) usersScope.push(self);
          }
        } else {
          usersScope = allUsers.filter((u) => (u.username || "").toLowerCase() === meLower);
        }

        const scopedTodos = allTodos.filter((t) => {
          if (isAdmin) return true;

          const owner = (t.username || "").toLowerCase();
          const assignee = (t.assigned_to || "").toLowerCase();
          const completedBy = (t.completed_by || "").toLowerCase();

          if (owner === meLower || assignee === meLower || completedBy === meLower) return true;
          if (inManagerList(t.manager_id, me.username)) return true;
          if (sharedIds.has(t.id)) return true;

          if (isManager) {
            if (teamUsers.has(owner) || teamUsers.has(assignee)) return true;
          }

          return false;
        });

        const scopedAccounts = allAccounts.filter((a) => canSeeAccount(me, a.customer_id));

        setCurrentUser(me);
        setVisibleUsers(usersScope);
        setVisibleTodos(scopedTodos);
        setVisibleAccounts(scopedAccounts);
      } catch {
        // Keep UI stable on data errors.
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session]);

  const kpis = useMemo<KPI[]>(() => {
    const total = visibleTodos.length;
    const assignedToMe = visibleTodos.filter((t) => (t.assigned_to || "").toLowerCase() === (currentUser?.username || "").toLowerCase()).length;
    const completed = visibleTodos.filter((t) => isDone(t)).length;
    const inProgress = visibleTodos.filter((t) => !isDone(t) && (t.task_status === "in_progress" || t.status === "in-progress")).length;
    const pending = visibleTodos.filter((t) => !isDone(t) && (t.approval_status === "pending_approval" || t.status === "pending")).length;
    const overdue = visibleTodos.filter((t) => isOverdue(t)).length;
    const dueToday = visibleTodos.filter((t) => isDueToday(t)).length;

    return [
      { label: "Total Tasks", value: total, icon: <ListChecks className="h-6 w-6" />, tone: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
      { label: "Assigned To Me", value: assignedToMe, icon: <UserCheck className="h-6 w-6" />, tone: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
      { label: "Completed", value: completed, icon: <CheckCircle2 className="h-6 w-6" />, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
      { label: "In Progress", value: inProgress, icon: <Clock3 className="h-6 w-6" />, tone: "bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300" },
      { label: "Pending Approval", value: pending, icon: <ShieldCheck className="h-6 w-6" />, tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
      { label: "Overdue", value: overdue, icon: <AlertTriangle className="h-6 w-6" />, tone: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
      { label: "Due Today", value: dueToday, icon: <Clock3 className="h-6 w-6" />, tone: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
      { label: "Visible Users", value: visibleUsers.length, icon: <Users className="h-6 w-6" />, tone: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
    ];
  }, [visibleTodos, visibleUsers.length, currentUser?.username]);

  const recentTasks = useMemo(() => {
    return [...visibleTodos]
      .sort((a, b) => {
        const bTime = new Date(b.updated_at || b.created_at).getTime();
        const aTime = new Date(a.updated_at || a.created_at).getTime();
        return bTime - aTime;
      })
      .slice(0, 10);
  }, [visibleTodos]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <Card className="p-6">
          <TableSkeleton rows={8} cols={5} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-white to-cyan-50 p-5 dark:border-gray-700 dark:from-gray-900 dark:to-cyan-950/30">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Live metrics from your real Supabase data. Scope reflects your role permissions.
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Visible Accounts: <strong>{visibleAccounts.length}</strong>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="transition-shadow hover:shadow-elevation-2">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.tone}`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Task Activity</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Task Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Assigned To</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => {
                  const statusLabel = task.approval_status === "pending_approval"
                    ? "pending_approval"
                    : task.task_status || task.status || "open";

                  return (
                    <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{task.title}</td>
                      <td className="px-4 py-3">
                        <Badge variant={isDone(task) ? "success" : statusLabel.includes("pending") ? "warning" : "info"}>
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "default"}>
                          {task.priority || "low"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{task.assigned_to || "-"}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(task.updated_at || task.created_at)}</td>
                    </tr>
                  );
                })}
                {recentTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No tasks in your visibility scope yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
