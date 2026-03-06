"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  Building2,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { formatDate, getStatusColor, getPriorityColor } from "@/lib/utils";

interface KPI {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [todosRes, usersRes, accountsRes] = await Promise.all([
          supabase.from("todos").select("id,title,status,priority,assigned_to,created_at,due_date"),
          supabase.from("users").select("username"),
          supabase.from("accounts").select("id"),
        ]);

        const todos = todosRes.data || [];
        const totalUsers = usersRes.data?.length || 0;
        const totalAccounts = accountsRes.data?.length || 0;

        const now = new Date();
        const openCount = todos.filter((t) => t.status === "open").length;
        const pendingCount = todos.filter((t) => t.status === "pending").length;
        const completedCount = todos.filter((t) => t.status === "completed").length;
        const overdueCount = todos.filter(
          (t) => t.due_date && new Date(t.due_date) < now && t.status !== "completed"
        ).length;

        setKpis([
          { label: "Total Tasks", value: todos.length, icon: <ListTodo className="h-6 w-6" />, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "Open / Active", value: openCount, icon: <Clock className="h-6 w-6" />, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
          { label: "Pending Approval", value: pendingCount, icon: <TrendingUp className="h-6 w-6" />, color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
          { label: "Completed", value: completedCount, icon: <CheckCircle className="h-6 w-6" />, color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
          { label: "Overdue", value: overdueCount, icon: <AlertTriangle className="h-6 w-6" />, color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
          { label: "Total Users", value: totalUsers, icon: <Users className="h-6 w-6" />, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
          { label: "Accounts", value: totalAccounts, icon: <Building2 className="h-6 w-6" />, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" },
        ]);

        setRecentTasks(todos.slice(0, 10));
      } catch {
        // Dashboard load failure handled silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <Card className="p-6"><TableSkeleton rows={5} cols={4} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your CMS portal</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="transition-shadow hover:shadow-elevation-2">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.color}`}>
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

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tasks</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Assigned To</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{task.title}</td>
                    <td className="px-4 py-3"><Badge className={getStatusColor(task.status)}>{task.status}</Badge></td>
                    <td className="px-4 py-3"><Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{task.assigned_to || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(task.created_at)}</td>
                  </tr>
                ))}
                {recentTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No tasks yet</td>
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
