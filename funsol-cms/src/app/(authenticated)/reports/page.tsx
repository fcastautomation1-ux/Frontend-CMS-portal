"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { SearchBar } from "@/components/ui/search-bar";
import { toast } from "@/components/ui/toast";
import { useAppStore } from "@/store";
import { supabase } from "@/lib/supabase";

export default function ReportsPage() {
  const user = useAppStore((s) => s.user);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", url: "", description: "", allowed_users: "" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const isAdmin = user?.role === "Admin" || user?.username === "admin";
  const isManager = user?.role === "Manager" || user?.role === "Super Manager" || isAdmin;

  const loadReports = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("looker_reports").select("*").order("name");
      if (error) throw error;
      setReports(data || []);
    } catch {
      toast("error", "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Filter reports based on user access
  const visibleReports = reports.filter((r) => {
    if (isManager) return true;
    if (!r.allowed_users) return true;
    const allowed = r.allowed_users.split(",").map((u: string) => u.trim().toLowerCase());
    return allowed.includes(user?.username?.toLowerCase() || "");
  });

  const filteredReports = visibleReports.filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setFormData({ name: "", url: "", description: "", allowed_users: "" });
    setEditMode(false);
    setModalOpen(true);
  };

  const openEdit = (report: any) => {
    setFormData({
      name: report.name,
      url: report.url,
      description: report.description || "",
      allowed_users: report.allowed_users || "",
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      toast("error", "Name and URL are required");
      return;
    }
    setSaving(true);
    try {
      if (editMode) {
        const { error } = await supabase.from("looker_reports").update(formData).eq("name", formData.name);
        if (error) throw error;
        toast("success", "Report updated");
      } else {
        const { error } = await supabase.from("looker_reports").insert({ ...formData, created_at: new Date().toISOString() });
        if (error) throw error;
        toast("success", "Report created");
      }
      setModalOpen(false);
      loadReports();
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { error } = await supabase.from("looker_reports").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      toast("success", "Report deleted");
      setDeleteConfirm(null);
      loadReports();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Reports</h1>
          <p className="text-sm text-gray-500">View Looker Studio reports</p>
        </div>
        {isManager && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Report
          </Button>
        )}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search reports..." className="max-w-md" />

      {/* Report Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Card key={report.id} className="group cursor-pointer transition-shadow hover:shadow-elevation-2">
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                  {isManager && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); openEdit(report); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(report); }} className="text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {report.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{report.description}</p>
                )}
                <div className="mt-auto flex gap-2">
                  <Button size="sm" onClick={() => setViewingReport(report)}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(report.url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" /> Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredReports.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No reports found
            </div>
          )}
        </div>
      )}

      {/* Report Viewer */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950">
          <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{viewingReport.name}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.open(viewingReport.url, "_blank")}>
                <ExternalLink className="h-4 w-4" /> Open in New Tab
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => setViewingReport(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <iframe
            src={viewingReport.url}
            className="h-[calc(100vh-56px)] w-full border-0"
            title={viewingReport.name}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}

      {/* Form Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Edit Report" : "Add Report"}>
        <div className="space-y-4">
          <Input label="Report Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={editMode} placeholder="e.g. Monthly Performance" />
          <Input label="Report URL" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://lookerstudio.google.com/..." />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" />
          <Input label="Allowed Users (comma-separated, leave empty for all)" value={formData.allowed_users} onChange={(e) => setFormData({ ...formData, allowed_users: e.target.value })} placeholder="user1, user2 or leave empty" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>{editMode ? "Save" : "Create"}</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Report" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">Delete &quot;{deleteConfirm?.name}&quot;?</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
