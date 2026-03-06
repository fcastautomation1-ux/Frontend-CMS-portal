"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
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
import { getRoleColor } from "@/lib/utils";
import type { UserRole } from "@/types";

interface UserRow {
  username: string;
  role: UserRole;
  email?: string;
  department?: string;
  password?: string;
  allowed_accounts?: string;
  allowed_drive_folders?: string;
  allowed_campaigns?: string;
  allowed_looker_reports?: string;
  drive_access_level?: string;
  manager_id?: string;
  team_members?: string;
  module_access?: string;
  last_login?: string;
  avatar_data?: string;
}

const roleOptions = [
  { value: "User", label: "User" },
  { value: "Supervisor", label: "Supervisor" },
  { value: "Manager", label: "Manager" },
  { value: "Super Manager", label: "Super Manager" },
  { value: "Admin", label: "Admin" },
];

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

export default function UsersPage() {
  const currentUser = useAppStore((s) => s.user);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "Admin" || currentUser?.username === "admin";
  const isManager = currentUser?.role === "Manager" || currentUser?.role === "Super Manager" || isAdmin;

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username,role,department,email,allowed_accounts,allowed_drive_folders,allowed_campaigns,allowed_looker_reports,last_login,drive_access_level,module_access,manager_id,team_members")
        .order("username");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.department || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setFormData(defaultForm);
    setEditMode(false);
    setModalOpen(true);
  };

  const openEdit = (user: UserRow) => {
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
    if (!formData.username.trim()) {
      toast("error", "Username is required");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        username: formData.username.trim().toLowerCase(),
        role: formData.role,
        email: formData.email.trim(),
        department: formData.department || null,
        allowed_accounts: formData.allowedAccounts || "",
        allowed_drive_folders: formData.allowedDriveFolders || "",
        allowed_campaigns: formData.allowedCampaigns || "",
        allowed_looker_reports: formData.allowedLookerReports || "",
        drive_access_level: formData.driveAccessLevel,
        manager_id: formData.managerId || null,
        team_members: formData.teamMembers || null,
      };

      if (formData.password) {
        // In a real app, password hashing happens server-side via API route
        payload.password = formData.password;
      }

      if (editMode) {
        const { error } = await supabase
          .from("users")
          .update(payload)
          .eq("username", formData.username);
        if (error) throw error;
        toast("success", `User "${formData.username}" updated successfully`);
      } else {
        if (!formData.password) {
          toast("error", "Password is required for new users");
          setSaving(false);
          return;
        }
        const { error } = await supabase.from("users").insert(payload);
        if (error) throw error;
        toast("success", `User "${formData.username}" created successfully`);
      }

      setModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toast("error", err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (username: string) => {
    try {
      const { error } = await supabase.from("users").delete().eq("username", username);
      if (error) throw error;
      toast("success", `User "${username}" deleted`);
      setDeleteConfirm(null);
      loadUsers();
    } catch (err: any) {
      toast("error", err.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Users</h1>
        </div>
        <Card className="p-6">
          <TableSkeleton rows={8} cols={5} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Users</h1>
          <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
        </div>
        {isManager && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="flex-1 max-w-md" />
        <Select
          options={[{ value: "", label: "All Roles" }, ...roleOptions]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                {isManager && (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((u) => (
                <tr key={u.username} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} size="sm" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <Badge className={getRoleColor(u.role)}>
                      <Shield className="mr-1 h-3 w-3" />
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {u.department || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {u.email || "—"}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}
                  </td>
                  {isManager && (
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(u)} title="Edit user">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {u.username !== "admin" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setDeleteConfirm(u.username)}
                            title="Delete user"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMode ? `Edit User: ${formData.username}` : "Add New User"}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={editMode}
            placeholder="Enter username"
          />
          <Select
            label="Role"
            options={roleOptions}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="user@example.com"
          />
          <Input
            label={editMode ? "New Password (leave blank to keep)" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={editMode ? "Leave blank to keep current" : "Min 6 characters"}
          />
          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="e.g. Marketing, Engineering"
          />
          <Input
            label="Manager ID"
            value={formData.managerId}
            onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
            placeholder="Manager username"
          />
          <Input
            label="Team Members"
            value={formData.teamMembers}
            onChange={(e) => setFormData({ ...formData, teamMembers: e.target.value })}
            placeholder="Comma-separated usernames"
          />
          <Select
            label="Drive Access Level"
            options={[
              { value: "viewer", label: "Viewer" },
              { value: "editor", label: "Editor" },
            ]}
            value={formData.driveAccessLevel}
            onChange={(e) => setFormData({ ...formData, driveAccessLevel: e.target.value })}
          />
          <div className="sm:col-span-2">
            <Input
              label="Allowed Accounts"
              value={formData.allowedAccounts}
              onChange={(e) => setFormData({ ...formData, allowedAccounts: e.target.value })}
              placeholder="Comma-separated account IDs or 'All'"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              label="Allowed Drive Folders"
              value={formData.allowedDriveFolders}
              onChange={(e) => setFormData({ ...formData, allowedDriveFolders: e.target.value })}
              placeholder="Comma-separated folder IDs"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {editMode ? "Save Changes" : "Create User"}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete User"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete user <strong>&quot;{deleteConfirm}&quot;</strong>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Delete User
          </Button>
        </div>
      </Modal>
    </div>
  );
}
