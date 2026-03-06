"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Power, PowerOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SearchBar } from "@/components/ui/search-bar";
import { TableSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAppStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

const workflowOptions = [
  { value: "workflow-0", label: "Default" },
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

export default function AccountsPage() {
  const currentUser = useAppStore((s) => s.user);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isManager = currentUser?.role === "Manager" || currentUser?.role === "Super Manager" || currentUser?.role === "Admin";

  const loadAccounts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("customer_id");

      if (error) throw error;
      setAccounts(data || []);
    } catch {
      toast("error", "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const filteredAccounts = accounts.filter((a) => {
    const matchSearch = !search || a.customer_id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === "enabled" ? a.enabled : !a.enabled);
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setFormData(defaultForm);
    setEditMode(false);
    setModalOpen(true);
  };

  const openEdit = (acc: any) => {
    setFormData({
      customerId: acc.customer_id,
      googleSheetLink: acc.google_sheet_link || "",
      driveCodeComments: acc.drive_code_comments || "",
      enabled: acc.enabled,
      workflow: acc.workflow || "workflow-0",
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.customerId.trim()) {
      toast("error", "Customer ID is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customer_id: formData.customerId.trim(),
        google_sheet_link: formData.googleSheetLink.trim(),
        drive_code_comments: formData.driveCodeComments,
        enabled: formData.enabled,
        workflow: formData.workflow,
      };

      if (editMode) {
        const { error } = await supabase.from("accounts").update(payload).eq("customer_id", formData.customerId);
        if (error) throw error;
        toast("success", "Account updated successfully");
      } else {
        const { error } = await supabase.from("accounts").insert({ ...payload, status: "Pending", created_date: new Date().toISOString() });
        if (error) throw error;
        toast("success", "Account created successfully");
      }
      setModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      toast("error", err.message || "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    try {
      const { error } = await supabase.from("accounts").delete().eq("customer_id", customerId);
      if (error) throw error;
      toast("success", "Account deleted");
      setDeleteConfirm(null);
      loadAccounts();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const toggleBatch = async (enabled: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase.from("accounts").update({ enabled }).in("customer_id", selectedIds);
      if (error) throw error;
      toast("success", `${selectedIds.length} accounts ${enabled ? "enabled" : "disabled"}`);
      setSelectedIds([]);
      loadAccounts();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Accounts</h1>
        <Card className="p-6"><TableSkeleton rows={6} cols={5} /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Accounts</h1>
          <p className="text-sm text-gray-500">Manage Google Ads accounts</p>
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
          {isManager && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add Account
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} placeholder="Search accounts..." className="flex-1 max-w-md" />
        <Select
          options={[
            { value: "", label: "All Status" },
            { value: "enabled", label: "Enabled" },
            { value: "disabled", label: "Disabled" },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedIds(e.target.checked ? filteredAccounts.map((a) => a.customer_id) : [])
                    }
                    checked={selectedIds.length === filteredAccounts.length && filteredAccounts.length > 0}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sheet Link</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Workflow</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Last Run</th>
                {isManager && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>}
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
                        setSelectedIds(
                          e.target.checked
                            ? [...selectedIds, acc.customer_id]
                            : selectedIds.filter((id) => id !== acc.customer_id)
                        )
                      }
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{acc.customer_id}</td>
                  <td className="px-4 py-3">
                    {acc.google_sheet_link ? (
                      <a
                        href={acc.google_sheet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Sheet
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{acc.workflow || "Default"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={acc.enabled ? "success" : "default"}>
                      {acc.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {acc.last_run ? formatDate(acc.last_run) : "Never"}
                  </td>
                  {isManager && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(acc)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteConfirm(acc.customer_id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Edit Account" : "Add Account"}>
        <div className="space-y-4">
          <Input
            label="Customer ID"
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            disabled={editMode}
            placeholder="e.g. 123-456-7890"
          />
          <Input
            label="Google Sheet Link"
            value={formData.googleSheetLink}
            onChange={(e) => setFormData({ ...formData, googleSheetLink: e.target.value })}
            placeholder="https://docs.google.com/spreadsheets/..."
          />
          <Input
            label="Drive / Code Comments"
            value={formData.driveCodeComments}
            onChange={(e) => setFormData({ ...formData, driveCodeComments: e.target.value })}
            placeholder="Drive folder IDs, comments"
          />
          <Select label="Workflow" options={workflowOptions} value={formData.workflow} onChange={(e) => setFormData({ ...formData, workflow: e.target.value })} />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="enabled" className="text-sm text-gray-700 dark:text-gray-300">Enabled</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editMode ? "Save Changes" : "Create Account"}</Button>
        </div>
      </Modal>

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Account" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delete account <strong>&quot;{deleteConfirm}&quot;</strong>? This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
