"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ExternalLink, Pencil, Plus, Power, PowerOff, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SearchBar } from "@/components/ui/search-bar";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type ModuleAccess = {
  googleAccount?: {
    enabled?: boolean;
    accessLevel?: "all" | "specific";
    accounts?: string[];
  };
};

type UserProfile = {
  username: string;
  role: string;
  allowed_accounts: string | null;
  module_access: string | ModuleAccess | null;
};

type AccountRow = {
  customer_id: string;
  google_sheet_link: string | null;
  drive_code_comments: string | null;
  enabled: boolean;
  workflow: string | null;
  status: string | null;
  created_date: string | null;
  last_run: string | null;
};

const workflowOptions = [
  { value: "workflow-0", label: "Workflow 0 (Default)" },
  { value: "workflow-1", label: "Workflow 1" },
  { value: "workflow-2", label: "Workflow 2" },
  { value: "workflow-3", label: "Workflow 3" },
];

const defaultForm = {
  customerId: "",
  googleSheetLink: "",
  driveCodeComments: "",
  enabled: true,
  workflow: "workflow-0",
};

function parseModuleAccess(raw: UserProfile["module_access"]): ModuleAccess {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) as ModuleAccess;
  } catch {
    return {};
  }
}

function parseAllowedAccounts(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const normalized = raw.trim();
  if (!normalized) return [];
  if (normalized === "All") return ["*"];
  return normalized
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function hasAllAccountAccess(user: UserProfile | null): boolean {
  if (!user) return false;
  if (user.username === "admin" || user.role === "Admin") return true;

  const moduleAccess = parseModuleAccess(user.module_access);
  if (user.role === "Manager" || user.role === "Super Manager") {
    const mod = moduleAccess.googleAccount;
    return !!(mod?.enabled && mod.accessLevel === "all");
  }

  return parseAllowedAccounts(user.allowed_accounts).includes("*");
}

function hasAccountAccess(user: UserProfile | null, customerId: string): boolean {
  if (!user) return false;
  if (user.username === "admin" || user.role === "Admin") return true;

  const moduleAccess = parseModuleAccess(user.module_access);
  if (user.role === "Manager" || user.role === "Super Manager") {
    const mod = moduleAccess.googleAccount;
    if (!mod?.enabled) return false;
    if (mod.accessLevel === "all") return true;
    const scoped = (mod.accounts || []).map((x) => x.trim());
    return scoped.includes(customerId.trim());
  }

  const allowed = parseAllowedAccounts(user.allowed_accounts);
  if (allowed.includes("*")) return true;
  return allowed.includes(customerId.trim());
}

export default function AccountsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const canManage = useMemo(() => {
    if (!profile) return false;
    return (
      profile.role === "Admin" ||
      profile.username === "admin" ||
      profile.role === "Manager" ||
      profile.role === "Super Manager"
    );
  }, [profile]);

  const canCreate = useMemo(() => hasAllAccountAccess(profile), [profile]);

  const loadProfile = useCallback(async () => {
    const username = (session?.user as { username?: string } | undefined)?.username;
    if (!username) return;

    const { data, error } = await supabase
      .from("users")
      .select("username,role,allowed_accounts,module_access")
      .eq("username", username)
      .single();

    if (error) {
      toast("error", "Failed to load your access profile");
      return;
    }

    setProfile(data as UserProfile);
  }, [session]);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("customer_id,google_sheet_link,drive_code_comments,enabled,workflow,status,created_date,last_run")
        .order("customer_id");

      if (error) throw error;
      const rows = (data || []) as AccountRow[];
      const filtered = profile ? rows.filter((a) => hasAccountAccess(profile, a.customer_id)) : rows;
      setAccounts(filtered);
    } catch {
      toast("error", "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) => {
      const matchSearch =
        !search ||
        a.customer_id.toLowerCase().includes(search.toLowerCase()) ||
        (a.google_sheet_link || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.drive_code_comments || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || (statusFilter === "enabled" ? a.enabled : !a.enabled);
      return matchSearch && matchStatus;
    });
  }, [accounts, search, statusFilter]);

  const openCreate = () => {
    if (!canCreate) {
      toast("error", "Only users with full account access can create accounts");
      return;
    }
    setFormData(defaultForm);
    setEditingCustomerId(null);
    setEditMode(false);
    setModalOpen(true);
  };

  const openEdit = (acc: AccountRow) => {
    if (!hasAccountAccess(profile, acc.customer_id)) {
      toast("error", "You do not have access to edit this account");
      return;
    }

    setFormData({
      customerId: acc.customer_id,
      googleSheetLink: acc.google_sheet_link || "",
      driveCodeComments: acc.drive_code_comments || "",
      enabled: acc.enabled,
      workflow: acc.workflow || "workflow-0",
    });
    setEditingCustomerId(acc.customer_id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const id = formData.customerId.trim();
    if (!id) {
      toast("error", "Customer ID is required");
      return;
    }

    if (!editMode && !canCreate) {
      toast("error", "You are not allowed to create new accounts");
      return;
    }

    if (editMode && editingCustomerId && !hasAccountAccess(profile, editingCustomerId)) {
      toast("error", "You do not have access to edit this account");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customer_id: id,
        google_sheet_link: formData.googleSheetLink.trim() || null,
        drive_code_comments: formData.driveCodeComments.trim() || null,
        enabled: formData.enabled,
        workflow: formData.workflow || "workflow-0",
      };

      if (editMode && editingCustomerId) {
        const { error } = await supabase.from("accounts").update(payload).eq("customer_id", editingCustomerId);
        if (error) throw error;
        toast("success", "Account updated successfully");
      } else {
        const { error } = await supabase.from("accounts").insert({
          ...payload,
          status: "Pending",
          created_date: new Date().toISOString(),
        });
        if (error) throw error;
        toast("success", "Account created successfully");
      }

      setModalOpen(false);
      setSelectedIds([]);
      await loadAccounts();
    } catch (err: unknown) {
      toast("error", err instanceof Error ? err.message : "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (!hasAllAccountAccess(profile)) {
      toast("error", "Only users with full account access can delete accounts");
      return;
    }

    try {
      const { error } = await supabase.from("accounts").delete().eq("customer_id", customerId);
      if (error) throw error;
      toast("success", "Account deleted");
      setDeleteConfirm(null);
      setSelectedIds((prev) => prev.filter((id) => id !== customerId));
      await loadAccounts();
    } catch (err: unknown) {
      toast("error", err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  const toggleBatch = async (enabled: boolean) => {
    if (selectedIds.length === 0) return;
    if (!canManage) {
      toast("error", "You do not have permission to update account status");
      return;
    }

    const unauthorized = selectedIds.find((id) => !hasAccountAccess(profile, id));
    if (unauthorized) {
      toast("error", `Unauthorized account in selection: ${unauthorized}`);
      return;
    }

    try {
      const { error } = await supabase.from("accounts").update({ enabled }).in("customer_id", selectedIds);
      if (error) throw error;
      toast("success", `${selectedIds.length} account(s) ${enabled ? "enabled" : "disabled"}`);
      setSelectedIds([]);
      await loadAccounts();
    } catch (err: unknown) {
      toast("error", err instanceof Error ? err.message : "Batch update failed");
    }
  };

  const total = filteredAccounts.length;
  const enabledCount = filteredAccounts.filter((a) => a.enabled).length;
  const disabledCount = total - enabledCount;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Accounts</h1>
        <Card className="p-6">
          <TableSkeleton rows={7} cols={7} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-white to-emerald-50 p-5 dark:border-gray-700 dark:from-gray-900 dark:to-emerald-950/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Accounts Module</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Migrated from legacy system with role-aware account visibility and workflow controls.
            </p>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <>
                <Button variant="success" size="sm" onClick={() => toggleBatch(true)}>
                  <Power className="h-4 w-4" /> Enable ({selectedIds.length})
                </Button>
                <Button variant="danger" size="sm" onClick={() => toggleBatch(false)}>
                  <PowerOff className="h-4 w-4" /> Disable ({selectedIds.length})
                </Button>
              </>
            )}
            {canManage && (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Add Account
              </Button>
            )}
          </div>
        </div>

        {!canCreate && canManage && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4" /> Your role can edit assigned accounts but cannot create/delete without full account access.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Visible Accounts</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Enabled</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{enabledCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Disabled</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{disabledCount}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by customer ID, sheet link, or comments..." className="flex-1" />
        <Select
          options={[
            { value: "", label: "All Status" },
            { value: "enabled", label: "Enabled" },
            { value: "disabled", label: "Disabled" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-44"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filteredAccounts.length > 0 && selectedIds.length === filteredAccounts.length}
                    onChange={(e) => setSelectedIds(e.target.checked ? filteredAccounts.map((a) => a.customer_id) : [])}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Customer ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sheet</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Drive/Code Comments</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Workflow</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Last Run</th>
                {canManage && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAccounts.map((acc) => (
                <tr key={acc.customer_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(acc.customer_id)}
                      onChange={(e) =>
                        setSelectedIds((prev) =>
                          e.target.checked ? [...prev, acc.customer_id] : prev.filter((id) => id !== acc.customer_id)
                        )
                      }
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{acc.customer_id}</td>
                  <td className="px-4 py-3 text-sm">
                    {acc.google_sheet_link ? (
                      <a
                        href={acc.google_sheet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary-600 hover:underline dark:text-primary-300"
                      >
                        <ExternalLink className="h-3 w-3" /> Open Sheet
                      </a>
                    ) : (
                      <span className="text-gray-400">No link</span>
                    )}
                  </td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {acc.drive_code_comments || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant="outline">{acc.workflow || "workflow-0"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={acc.enabled ? "success" : "default"}>{acc.enabled ? "Enabled" : "Disabled"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{acc.last_run ? formatDate(acc.last_run) : "Never"}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(acc)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteConfirm(acc.customer_id)}
                          disabled={!canCreate}
                          className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No accounts found for your access scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Edit Account" : "Create Account"}>
        <div className="space-y-4">
          <Input
            label="Customer ID"
            value={formData.customerId}
            onChange={(e) => setFormData((prev) => ({ ...prev, customerId: e.target.value }))}
            disabled={editMode}
            placeholder="123-456-7890"
          />
          <Input
            label="Google Sheet Link"
            value={formData.googleSheetLink}
            onChange={(e) => setFormData((prev) => ({ ...prev, googleSheetLink: e.target.value }))}
            placeholder="https://docs.google.com/spreadsheets/..."
          />
          <Input
            label="Drive / Code Comments"
            value={formData.driveCodeComments}
            onChange={(e) => setFormData((prev) => ({ ...prev, driveCodeComments: e.target.value }))}
            placeholder="Folder IDs, notes, code comments"
          />
          <Select
            label="Workflow"
            options={workflowOptions}
            value={formData.workflow}
            onChange={(e) => setFormData((prev) => ({ ...prev, workflow: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={formData.enabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            Account is enabled
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editMode ? "Save Changes" : "Create Account"}</Button>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Account" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delete account <strong>{deleteConfirm}</strong>? This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
