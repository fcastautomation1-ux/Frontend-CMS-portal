"use client";

import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Key,
  Workflow,
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { useAppStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "workflows" | "credentials" | "notifications";

export default function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const isAdmin = user?.role === "Admin" || user?.username === "admin";

  const tabs = [
    { key: "profile", label: "Profile", icon: User },
    ...(isAdmin ? [{ key: "workflows", label: "Workflows", icon: Workflow }] : []),
    ...(isAdmin ? [{ key: "credentials", label: "Credentials", icon: Key }] : []),
    { key: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account and system settings</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <nav className="flex lg:w-56 lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as SettingsTab)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === t.key
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "workflows" && isAdmin && <WorkflowSettings />}
          {activeTab === "credentials" && isAdmin && <CredentialSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const user = useAppStore((s) => s.user);
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const updates: any = { email };
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast("error", "Passwords do not match");
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          toast("error", "Password must be at least 6 characters");
          setSaving(false);
          return;
        }
        updates.password = newPassword;
      }
      const { error } = await supabase.from("users").update(updates).eq("username", user?.username);
      if (error) throw error;
      toast("success", "Profile updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Info</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Username" value={user?.username || ""} disabled />
            <Input label="Role" value={user?.role || ""} disabled />
            <Input label="Department" value={user?.department || ""} disabled />
            <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-3">
            <div className="relative">
              <Input
                label="Current Password"
                type={showPasswords ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <Input
              label="New Password"
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm Password"
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showPasswords} onChange={(e) => setShowPasswords(e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Show passwords</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleUpdateProfile} loading={saving}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function WorkflowSettings() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase.from("workflows").select("*").order("id");
      if (error) throw error;
      setWorkflows(data || []);
    } catch {
      toast("error", "Failed to load workflows");
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (wf: any) => {
    try {
      const { error } = await supabase.from("workflows").update({ enabled: !wf.enabled }).eq("id", wf.id);
      if (error) throw error;
      toast("success", `${wf.name} ${wf.enabled ? "disabled" : "enabled"}`);
      loadWorkflows();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Management</h2>
        <p className="text-sm text-gray-500">Enable or disable approval workflows</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded bg-gray-100 dark:bg-gray-800" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {workflows.map((wf) => (
              <div key={wf.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{wf.name}</p>
                  {wf.description && <p className="text-sm text-gray-500">{wf.description}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={wf.enabled ? "success" : "outline"}>{wf.enabled ? "Active" : "Disabled"}</Badge>
                  <button
                    onClick={() => toggleWorkflow(wf)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      wf.enabled ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
                      wf.enabled ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>
            ))}
            {workflows.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">No workflows configured</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CredentialSettings() {
  const [creds, setCreds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [showValues, setShowValues] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCreds();
  }, []);

  const loadCreds = async () => {
    try {
      const { data, error } = await supabase.from("credentials").select("*").order("name");
      if (error) throw error;
      setCreds(data || []);
    } catch {
      toast("error", "Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const saveCred = async () => {
    if (!name.trim()) return;
    try {
      const { error } = await supabase.from("credentials").upsert({ name: name.trim(), value: value, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast("success", "Credential saved");
      setModalOpen(false);
      setName("");
      setValue("");
      loadCreds();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const deleteCred = async (id: string) => {
    try {
      await supabase.from("credentials").delete().eq("id", id);
      toast("success", "Credential deleted");
      loadCreds();
    } catch (err: any) {
      toast("error", err.message);
    }
  };

  const toggleShow = (id: string) => {
    setShowValues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Credentials</h2>
            <p className="text-sm text-gray-500">API keys and secrets</p>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-10 rounded bg-gray-100 dark:bg-gray-800" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {creds.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2.5 dark:border-gray-700">
                <Key className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
                <span className="flex-1 overflow-hidden font-mono text-xs text-gray-500">
                  {showValues.has(c.id) ? c.value : "••••••••"}
                </span>
                <button onClick={() => toggleShow(c.id)} className="text-gray-400 hover:text-gray-600">
                  {showValues.has(c.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => deleteCred(c.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {creds.length === 0 && <p className="py-4 text-center text-sm text-gray-500">No credentials stored</p>}
          </div>
        )}
      </CardContent>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Credential" size="sm">
        <div className="space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GOOGLE_API_KEY" />
          <Input label="Value" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={saveCred}>Save</Button>
        </div>
      </Modal>
    </Card>
  );
}

function NotificationSettings() {
  const [desktopEnabled, setDesktopEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setDesktopEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast("error", "Browser does not support notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    setDesktopEnabled(permission === "granted");
    if (permission === "granted") {
      toast("success", "Desktop notifications enabled");
    } else {
      toast("warning", "Permission denied");
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Desktop Notifications</p>
            <p className="text-sm text-gray-500">Show browser notifications for new events</p>
          </div>
          {desktopEnabled ? (
            <Badge variant="success">Enabled</Badge>
          ) : (
            <Button size="sm" onClick={requestPermission}><Bell className="h-4 w-4" /> Enable</Button>
          )}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Sound Notifications</p>
            <p className="text-sm text-gray-500">Play a sound for new notifications</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              soundEnabled ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
            )}
          >
            <span className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
              soundEnabled ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive email for important updates</p>
          </div>
          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              emailEnabled ? "bg-primary-500" : "bg-gray-200 dark:bg-gray-700"
            )}
          >
            <span className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
              emailEnabled ? "translate-x-5" : "translate-x-0"
            )} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
