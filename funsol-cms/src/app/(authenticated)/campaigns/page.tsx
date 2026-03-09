"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Edit3, Layers, Save, SearchCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { SearchBar } from "@/components/ui/search-bar";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

type ModuleAccess = {
  googleAccount?: {
    enabled?: boolean;
    accessLevel?: "all" | "specific";
    accounts?: string[];
  };
  campaigns?: {
    enabled?: boolean;
    accessLevel?: "all" | "specific";
  };
};

type UserProfile = {
  username: string;
  role: string;
  allowed_accounts: string | null;
  allowed_campaigns: string | null;
  module_access: string | ModuleAccess | null;
};

type AccountRow = {
  customer_id: string;
  workflow: string | null;
  enabled: boolean;
};

type CampaignRow = {
  id?: number;
  customer_id: string;
  campaign_name: string;
  removal_conditions: string | null;
  enabled: boolean | null;
  workflow: string;
  table: string;
};

const workflowToTable: Record<string, string> = {
  "workflow-0": "campaign_conditions",
  "workflow-1": "workflow_1",
  "workflow-2": "workflow_2",
  "workflow-3": "workflow_3",
};

const tableToWorkflow: Record<string, string> = {
  campaign_conditions: "workflow-0",
  workflow_1: "workflow-1",
  workflow_2: "workflow-2",
  workflow_3: "workflow-3",
};

const workflowOptions = [
  { value: "workflow-0", label: "Workflow 0" },
  { value: "workflow-1", label: "Workflow 1" },
  { value: "workflow-2", label: "Workflow 2" },
  { value: "workflow-3", label: "Workflow 3" },
];

function parseModuleAccess(raw: UserProfile["module_access"]): ModuleAccess {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) as ModuleAccess;
  } catch {
    return {};
  }
}

function parseAllowed(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const normalized = raw.trim();
  if (!normalized) return [];
  if (normalized === "All") return ["*"];
  return normalized
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function hasAccountAccess(user: UserProfile | null, customerId: string): boolean {
  if (!user) return false;
  if (user.username === "admin" || user.role === "Admin") return true;

  const moduleAccess = parseModuleAccess(user.module_access);
  if (user.role === "Manager" || user.role === "Super Manager") {
    const mod = moduleAccess.googleAccount;
    if (!mod?.enabled) return false;
    if (mod.accessLevel === "all") return true;
    return (mod.accounts || []).map((x) => x.trim()).includes(customerId.trim());
  }

  const allowed = parseAllowed(user.allowed_accounts);
  return allowed.includes("*") || allowed.includes(customerId.trim());
}

function hasCampaignAccess(user: UserProfile | null, campaignName: string): boolean {
  if (!user) return false;
  if (user.username === "admin" || user.role === "Admin") return true;

  const moduleAccess = parseModuleAccess(user.module_access);
  if (user.role === "Manager" || user.role === "Super Manager") {
    const mod = moduleAccess.campaigns;
    if (mod && mod.enabled) {
      if (mod.accessLevel === "all") return true;
      const allowedCampaigns = parseAllowed(user.allowed_campaigns);
      return allowedCampaigns.includes("*") || allowedCampaigns.includes(campaignName.trim());
    }
  }

  const allowedCampaigns = parseAllowed(user.allowed_campaigns);
  if (allowedCampaigns.length === 0) return true;
  return allowedCampaigns.includes("*") || allowedCampaigns.includes(campaignName.trim());
}

export default function CampaignsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("");
  const [editingCampaign, setEditingCampaign] = useState<CampaignRow | null>(null);
  const [conditions, setConditions] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [batchConditions, setBatchConditions] = useState("");
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const canEdit = useMemo(() => {
    if (!profile) return false;
    return (
      profile.role === "Admin" ||
      profile.username === "admin" ||
      profile.role === "Manager" ||
      profile.role === "Super Manager"
    );
  }, [profile]);

  const loadProfile = useCallback(async () => {
    const username = (session?.user as { username?: string } | undefined)?.username;
    if (!username) return;

    const { data, error } = await supabase
      .from("users")
      .select("username,role,allowed_accounts,allowed_campaigns,module_access")
      .eq("username", username)
      .single();

    if (error) {
      toast("error", "Failed to load your campaign access profile");
      return;
    }

    setProfile(data as UserProfile);
  }, [session]);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("customer_id,workflow,enabled")
        .order("customer_id");

      if (error) throw error;
      const rows = (data || []) as AccountRow[];
      const accessible = profile ? rows.filter((a) => hasAccountAccess(profile, a.customer_id)) : rows;
      setAccounts(accessible);

      if (accessible.length > 0 && !selectedAccount) {
        setSelectedAccount(accessible[0].customer_id);
      }
      if (accessible.length === 0) {
        setSelectedAccount("");
      }
    } catch {
      toast("error", "Failed to load accounts for campaign module");
    } finally {
      setLoading(false);
    }
  }, [profile, selectedAccount]);

  const loadCampaigns = useCallback(async (customerId: string) => {
    if (!customerId) {
      setCampaigns([]);
      return;
    }

    setCampaignLoading(true);
    try {
      const tables = ["campaign_conditions", "workflow_1", "workflow_2", "workflow_3"];
      const results = await Promise.all(
        tables.map(async (table) => {
          const { data, error } = await supabase
            .from(table)
            .select("id,customer_id,campaign_name,removal_conditions,enabled,workflow")
            .eq("customer_id", customerId)
            .order("campaign_name");

          if (error) throw error;

          return (data || []).map((row) => ({
            ...(row as Omit<CampaignRow, "table" | "workflow">),
            table,
            workflow: (row.workflow as string) || tableToWorkflow[table] || "workflow-0",
          })) as CampaignRow[];
        })
      );

      const merged = results.flat();
      const filteredByCampaign = profile
        ? merged.filter((c) => hasCampaignAccess(profile, c.campaign_name || ""))
        : merged;

      setCampaigns(filteredByCampaign);
      setSelectedCampaigns([]);
    } catch {
      toast("error", "Failed to load campaigns");
    } finally {
      setCampaignLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (selectedAccount) loadCampaigns(selectedAccount);
  }, [selectedAccount, loadCampaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch = !search || c.campaign_name.toLowerCase().includes(search.toLowerCase());
      const matchWorkflow = !workflowFilter || c.workflow === workflowFilter;
      return matchSearch && matchWorkflow;
    });
  }, [campaigns, search, workflowFilter]);

  const openEdit = (campaign: CampaignRow) => {
    if (!canEdit) {
      toast("error", "You do not have permission to edit campaigns");
      return;
    }
    setEditingCampaign(campaign);
    setConditions(campaign.removal_conditions || "");
  };

  const saveCampaignConditions = async () => {
    if (!editingCampaign || !selectedAccount) return;
    setSaving(true);

    try {
      const table = workflowToTable[editingCampaign.workflow] || editingCampaign.table || "campaign_conditions";
      const payload = {
        customer_id: selectedAccount,
        campaign_name: editingCampaign.campaign_name,
        removal_conditions: conditions,
        enabled: editingCampaign.enabled ?? true,
        workflow: editingCampaign.workflow,
      };

      // Upsert matches legacy behavior where campaign conditions can be created/updated by customer+campaign.
      const { error } = await supabase.from(table).upsert(payload, { onConflict: "customer_id,campaign_name" });
      if (error) throw error;

      toast("success", "Campaign conditions saved");
      setEditingCampaign(null);
      await loadCampaigns(selectedAccount);
    } catch (err: unknown) {
      toast("error", err instanceof Error ? err.message : "Failed to save conditions");
    } finally {
      setSaving(false);
    }
  };

  const saveBatchConditions = async () => {
    if (!selectedAccount || selectedCampaigns.length === 0) {
      toast("error", "Select campaigns first");
      return;
    }

    setSaving(true);
    try {
      const selectedRows = campaigns.filter((c) => selectedCampaigns.includes(`${c.table}:${c.campaign_name}`));
      let ok = 0;
      let failed = 0;

      for (const row of selectedRows) {
        const table = workflowToTable[row.workflow] || row.table || "campaign_conditions";
        const payload = {
          customer_id: selectedAccount,
          campaign_name: row.campaign_name,
          removal_conditions: batchConditions,
          enabled: row.enabled ?? true,
          workflow: row.workflow,
        };
        const { error } = await supabase.from(table).upsert(payload, { onConflict: "customer_id,campaign_name" });
        if (error) {
          failed += 1;
        } else {
          ok += 1;
        }
      }

      if (failed > 0) {
        toast("warning", `${ok} updated, ${failed} failed`);
      } else {
        toast("success", `${ok} campaign(s) updated`);
      }

      setBatchModalOpen(false);
      setBatchConditions("");
      setSelectedCampaigns([]);
      await loadCampaigns(selectedAccount);
    } catch {
      toast("error", "Batch update failed");
    } finally {
      setSaving(false);
    }
  };

  const total = filteredCampaigns.length;
  const activeCount = filteredCampaigns.filter((c) => c.enabled !== false).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-white to-blue-50 p-5 dark:border-gray-700 dark:from-gray-900 dark:to-blue-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Campaigns Module</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Legacy-style campaign conditions across all workflow tables with permission-aware editing.
            </p>
          </div>
          {canEdit && selectedCampaigns.length > 0 && (
            <Button onClick={() => setBatchModalOpen(true)}>
              <Layers className="h-4 w-4" /> Batch Edit ({selectedCampaigns.length})
            </Button>
          )}
        </div>

        {!canEdit && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4" /> You are in read-only mode for campaign conditions.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Visible Campaigns</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Active Campaigns</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</p>
        </Card>
      </div>

      <Card className="p-4">
        {loading ? (
          <TableSkeleton rows={2} cols={2} />
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            <Select
              label="Account"
              options={[
                { value: "", label: accounts.length > 0 ? "Choose account" : "No accessible accounts" },
                ...accounts.map((a) => ({
                  value: a.customer_id,
                  label: `${a.customer_id}${a.enabled ? "" : " (disabled)"}`,
                })),
              ]}
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            />
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search campaign name..."
              className="lg:mt-[22px]"
            />
            <Select
              label="Workflow"
              options={[{ value: "", label: "All workflows" }, ...workflowOptions]}
              value={workflowFilter}
              onChange={(e) => setWorkflowFilter(e.target.value)}
            />
          </div>
        )}
      </Card>

      {selectedAccount && (
        <Card>
          {campaignLoading ? (
            <div className="p-6">
              <TableSkeleton rows={6} cols={5} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    {canEdit && (
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={filteredCampaigns.length > 0 && selectedCampaigns.length === filteredCampaigns.length}
                          onChange={(e) =>
                            setSelectedCampaigns(
                              e.target.checked ? filteredCampaigns.map((c) => `${c.table}:${c.campaign_name}`) : []
                            )
                          }
                          className="rounded border-gray-300"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Workflow</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Conditions</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCampaigns.map((c) => {
                    const key = `${c.table}:${c.campaign_name}`;
                    return (
                      <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        {canEdit && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedCampaigns.includes(key)}
                              onChange={(e) =>
                                setSelectedCampaigns((prev) =>
                                  e.target.checked ? [...prev, key] : prev.filter((item) => item !== key)
                                )
                              }
                              className="rounded border-gray-300"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{c.campaign_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline">{c.workflow}</Badge>
                        </td>
                        <td className="max-w-[420px] px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="line-clamp-2 whitespace-pre-wrap">{c.removal_conditions || "No conditions"}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={c.enabled !== false ? "success" : "default"}>
                            {c.enabled !== false ? "Active" : "Disabled"}
                          </Badge>
                        </td>
                        {canEdit && (
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={canEdit ? 6 : 5} className="px-6 py-10 text-center text-sm text-gray-500">
                        <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                          <SearchCheck className="h-5 w-5 text-gray-400" />
                          No campaign rows found for this account and filter.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        title={`Edit Conditions: ${editingCampaign?.campaign_name || ""}`}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Workflow"
            options={workflowOptions}
            value={editingCampaign?.workflow || "workflow-0"}
            onChange={(e) =>
              setEditingCampaign((prev) => (prev ? { ...prev, workflow: e.target.value } : prev))
            }
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Removal Conditions
            </label>
            <textarea
              rows={9}
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="One rule per line or JSON expression"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEditingCampaign(null)}>Cancel</Button>
          <Button onClick={saveCampaignConditions} loading={saving}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </Modal>

      <Modal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title={`Batch Update (${selectedCampaigns.length} Campaigns)`}
        size="lg"
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Apply Removal Conditions To Selected
          </label>
          <textarea
            rows={9}
            value={batchConditions}
            onChange={(e) => setBatchConditions(e.target.value)}
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="These conditions will overwrite selected campaigns"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setBatchModalOpen(false)}>Cancel</Button>
          <Button onClick={saveBatchConditions} loading={saving}>Apply</Button>
        </div>
      </Modal>
    </div>
  );
}
