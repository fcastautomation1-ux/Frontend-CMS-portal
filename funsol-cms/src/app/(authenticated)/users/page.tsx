"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Pencil, Plus, Shield, Trash2, UsersRound } from "lucide-react";
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
import { supabase } from "@/lib/supabase";
import { getRoleColor } from "@/lib/utils";
import type { UserRole } from "@/types";

type ModuleAccess = {
  users?: {
    enabled?: boolean;
    departmentRestricted?: boolean;
  };
};

interface UserRow {
  username: string;
  role: UserRole;
  email?: string | null;
  department?: string | null;
  allowed_accounts?: string | null;
  allowed_drive_folders?: string | null;
  allowed_campaigns?: string | null;
  allowed_looker_reports?: string | null;
  drive_access_level?: string | null;
  manager_id?: string | null;
  team_members?: string | null;
  module_access?: string | ModuleAccess | null;
  last_login?: string | null;
}

const roleOptions = [
  { value: "User", label: "User" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Manager", label: "Manager" },
  { value: "Super Manager", label: "Super Manager" },
  { value: "Admin", label: "Admin" },
];

const managerCreatableRoles = new Set<UserRole>(["User", "Supervisor"]);

const defaultForm = {
  username: "",
  role: "User" as UserRole,
  email: "",
  password: "",
  department: "",
  allowedAccounts: "",
  allowedDriveFolders: "",
  allowedCampaigns: "",
  allowedLookerReports: "",
  driveAccessLevel: "viewer",
  managerId: "",
  teamMembers: "",
};

function parseCsv(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function inManagerList(managerField: string | null | undefined, username: string): boolean {
  if (!managerField) return false;
  const me = username.toLowerCase();
  return parseCsv(managerField).some((m) => m.toLowerCase() === me);
}

function parseModuleAccess(raw: UserRow["module_access"]): ModuleAccess {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) as ModuleAccess;
  } catch {
    return {};
  }
}

function getVisibleUsers(caller: UserRow | null, allUsers: UserRow[]): UserRow[] {
  if (!caller) return [];

  const me = caller.username.toLowerCase();
  const isAdminOrSuper = caller.username === "admin" || caller.role === "Admin" || caller.role === "Super Manager";
  if (isAdminOrSuper) return allUsers;

  if (caller.role === "Manager") {
    const explicitTeam = new Set(parseCsv(caller.team_members).map((u) => u.toLowerCase()));
    const reverseTeam = new Set<string>();

    allUsers.forEach((u) => {
      if (inManagerList(u.manager_id, caller.username)) {
        reverseTeam.add((u.username || "").toLowerCase());
      }
    });

    const usersMod = parseModuleAccess(caller.module_access).users;
    const hasDeptRestriction = !!(usersMod?.enabled && usersMod.departmentRestricted !== false);

    let base = allUsers;
    if (hasDeptRestriction && caller.department) {
      base = allUsers.filter(
        (u) => (u.department || "").toLowerCase() === (caller.department || "").toLowerCase()
      );
    }

    const scoped = base.filter((u) => {
      const uLower = (u.username || "").toLowerCase();
      return uLower === me || explicitTeam.has(uLower) || reverseTeam.has(uLower) || inManagerList(u.manager_id, caller.username);
    });

    if (!scoped.some((u) => (u.username || "").toLowerCase() === me)) {
      const self = allUsers.find((u) => (u.username || "").toLowerCase() === me);
      if (self) scoped.push(self);
    }

    return scoped;
  }

  return allUsers.filter((u) => (u.username || "").toLowerCase() === me);
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [caller, setCaller] = useState<UserRow | null>(null);
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const visibleUsers = useMemo(() => getVisibleUsers(caller, allUsers), [caller, allUsers]);

  const filteredUsers = useMemo(() => {
    return visibleUsers.filter((u) => {
      const s = search.toLowerCase().trim();
      const matchSearch =
        !s ||
        (u.username || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s) ||
        (u.department || "").toLowerCase().includes(s) ||
        (u.allowed_accounts || "").toLowerCase().includes(s);

      const matchRole = !roleFilter || u.role === roleFilter;
      const matchDept = !departmentFilter || (u.department || "") === departmentFilter;
      return matchSearch && matchRole && matchDept;
    });
  }, [visibleUsers, search, roleFilter, departmentFilter]);

  const departments = useMemo(() => {
    return Array.from(new Set(visibleUsers.map((u) => (u.department || "").trim()).filter(Boolean))).sort();
  }, [visibleUsers]);

  const isAdminOrSuper = useMemo(() => {
    if (!caller) return false;
    return caller.username === "admin" || caller.role === "Admin" || caller.role === "Super Manager";
  }, [caller]);

  const isManager = caller?.role === "Manager";
  const canManage = isAdminOrSuper || isManager;

  const loadUsers = useCallback(async () => {
    const username = (session?.user as { username?: string } | undefined)?.username;
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const [callerRes, usersRes] = await Promise.all([
        supabase
          .from("users")
          .select("username,role,email,department,allowed_accounts,allowed_drive_folders,allowed_campaigns,allowed_looker_reports,last_login,drive_access_level,module_access,manager_id,team_members")
          .eq("username", username)
          .single(),
        supabase
          .from("users")
          .select("username,role,email,department,allowed_accounts,allowed_drive_folders,allowed_campaigns,allowed_looker_reports,last_login,drive_access_level,module_access,manager_id,team_members")
          .order("username"),
      ]);

      if (callerRes.error) throw callerRes.error;
      if (usersRes.error) throw usersRes.error;

      setCaller(callerRes.data as UserRow);
      setAllUsers((usersRes.data || []) as UserRow[]);
    } catch (err) {
      console.error(err);
      toast("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    if (!canManage) return;
    setFormData(defaultForm);
    setEditMode(false);
    setModalOpen(true);
  };

  const openEdit = (user: UserRow) => {
    if (!canManage) return;

    setFormData({
      username: user.username,
      role: user.role,
      email: user.email || "",
      password: "",
      department: user.department || "",
      allowedAccounts: user.allowed_accounts || "",
      allowedDriveFolders: user.allowed_drive_folders || "",
      allowedCampaigns: user.allowed_campaigns || "",
      allowedLookerReports: user.allowed_looker_reports || "",
      driveAccessLevel: user.drive_access_level || "viewer",
      managerId: user.manager_id || "",
      teamMembers: user.team_members || "",
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!canManage) {
      toast("error", "You do not have permission to manage users");
      return;
    }

    const username = formData.username.trim().toLowerCase();
    if (!username) {
      toast("error", "Username is required");
      return;
    }

    if (isManager && !isAdminOrSuper) {
      if (!managerCreatableRoles.has(formData.role)) {
        toast("error", "Manager can only create/edit User or Supervisor roles");
        return;
      }

      if (!formData.department.trim()) {
        toast("error", "Department is required for manager-created users");
        return;
      }

      if ((caller?.department || "").trim().toLowerCase() !== formData.department.trim().toLowerCase()) {
        toast("error", "Manager can only manage users in their own department");
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        username,
        role: formData.role,
        email: formData.email.trim() || null,
        department: formData.department.trim() || null,
        allowed_accounts: formData.allowedAccounts.trim() || null,
        allowed_drive_folders: formData.allowedDriveFolders.trim() || null,
        allowed_campaigns: formData.allowedCampaigns.trim() || null,
        allowed_looker_reports: formData.allowedLookerReports.trim() || null,
        drive_access_level: formData.driveAccessLevel || "viewer",
        manager_id: formData.managerId.trim() || null,
        team_members: formData.teamMembers.trim() || null,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      if (!editMode && !formData.password.trim()) {
        toast("error", "Password is required for new user");
        setSaving(false);
        return;
      }

      const endpoint = "/api/users";
      const method = editMode ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save user");
      }

      toast("success", editMode ? `User "${username}" updated` : `User "${username}" created`);
      setModalOpen(false);
      await loadUsers();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (username: string) => {
    if (!isAdminOrSuper) {
      toast("error", "Only Admin or Super Manager can delete users");
      return;
    }

    try {
      const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete user");
      toast("success", `User "${username}" deleted`);
      setDeleteConfirm(null);
      await loadUsers();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const managerSummary = useMemo(() => {
    if (!caller || caller.role !== "Manager") return null;
    const explicit = parseCsv(caller.team_members).length;
    const reverse = allUsers.filter((u) => inManagerList(u.manager_id, caller.username)).length;
    return { explicit, reverse };
  }, [caller, allUsers]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Users</h1>
        <Card className="p-6">
          <TableSkeleton rows={8} cols={6} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-white to-teal-50 p-5 dark:border-gray-700 dark:from-gray-900 dark:to-teal-950/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Users Module</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Role-scoped user management with team and department controls aligned to legacy behavior.
            </p>
          </div>
          {canManage && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add User
            </Button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">Visible Users: {visibleUsers.length}</Badge>
          <Badge variant="outline">Role: {caller?.role || "-"}</Badge>
          {managerSummary && (
            <Badge variant="outline">
              Team (explicit/reverse): {managerSummary.explicit}/{managerSummary.reverse}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Users In Scope</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{visibleUsers.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Managers</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{visibleUsers.filter((u) => u.role === "Manager").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Super/Admin</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">
            {visibleUsers.filter((u) => u.role === "Super Manager" || u.role === "Admin").length}
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users, department, email, accounts..." className="flex-1" />
        <Select
          options={[{ value: "", label: "All Roles" }, ...roleOptions]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-44"
        />
        <Select
          options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d, label: d }))]}
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="w-52"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Manager(s)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Allowed Accounts</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Last Login</th>
                {canManage && <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((u) => (
                <tr key={u.username} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.username}</p>
                        <p className="text-xs text-gray-500">{u.email || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <Badge className={getRoleColor(u.role)}>
                      <Shield className="mr-1 h-3 w-3" />
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{u.department || "-"}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{u.manager_id || "-"}</td>
                  <td className="max-w-[260px] truncate px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {u.allowed_accounts || "-"}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}
                  </td>
                  {canManage && (
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)} title="Edit user">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdminOrSuper && u.username !== "admin" && u.username !== caller?.username && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteConfirm(u.username)}
                            title="Delete user"
                            className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-6 py-8 text-center text-sm text-gray-500">
                    <div className="mx-auto flex max-w-md items-center justify-center gap-2">
                      <UsersRound className="h-4 w-4" /> No users match current filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? `Edit User: ${formData.username}` : "Add New User"} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            disabled={editMode}
          />
          <Select
            label="Role"
            options={isManager && !isAdminOrSuper ? roleOptions.filter((r) => managerCreatableRoles.has(r.value as UserRole)) : roleOptions}
            value={formData.role}
            onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label={editMode ? "New Password (optional)" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
            disabled={isManager && !isAdminOrSuper}
          />
          <Select
            label="Drive Access"
            options={[{ value: "viewer", label: "Viewer" }, { value: "editor", label: "Editor" }]}
            value={formData.driveAccessLevel}
            onChange={(e) => setFormData((prev) => ({ ...prev, driveAccessLevel: e.target.value }))}
          />
          <Input
            label="Manager ID"
            value={formData.managerId}
            onChange={(e) => setFormData((prev) => ({ ...prev, managerId: e.target.value }))}
          />
          <Input
            label="Team Members"
            value={formData.teamMembers}
            onChange={(e) => setFormData((prev) => ({ ...prev, teamMembers: e.target.value }))}
          />
          <div className="sm:col-span-2">
            <Input
              label="Allowed Accounts"
              value={formData.allowedAccounts}
              onChange={(e) => setFormData((prev) => ({ ...prev, allowedAccounts: e.target.value }))}
              placeholder="All or comma-separated IDs"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Allowed Campaigns"
              value={formData.allowedCampaigns}
              onChange={(e) => setFormData((prev) => ({ ...prev, allowedCampaigns: e.target.value }))}
              placeholder="All or comma-separated campaign names"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Allowed Drive Folders"
              value={formData.allowedDriveFolders}
              onChange={(e) => setFormData((prev) => ({ ...prev, allowedDriveFolders: e.target.value }))}
              placeholder="Comma-separated folder IDs"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editMode ? "Save Changes" : "Create User"}</Button>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delete user <strong>{deleteConfirm}</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
