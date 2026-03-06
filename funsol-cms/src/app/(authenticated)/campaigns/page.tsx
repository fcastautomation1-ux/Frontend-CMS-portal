"use client";

import { useEffect, useState, useCallback } from "react";
import { Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { SearchBar } from "@/components/ui/search-bar";
import { TableSkeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

const workflowTables: Record<string, string> = {
  "workflow-0": "campaign_conditions",
  "workflow-1": "workflow_1",
  "workflow-2": "workflow_2",
  "workflow-3": "workflow_3",
};

export default function CampaignsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [conditions, setConditions] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      const { data } = await supabase.from("accounts").select("customer_id,workflow,enabled").order("customer_id");
      setAccounts(data || []);
    }
    loadAccounts();
  }, []);

  const loadCampaigns = useCallback(async (customerId: string) => {
    if (!customerId) return;
    setLoading(true);
    try {
      const account = accounts.find((a) => a.customer_id === customerId);
      const workflow = account?.workflow || "workflow-0";
      const table = workflowTables[workflow] || "campaign_conditions";

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("customer_id", customerId)
        .order("campaign_name");

      if (error) throw error;
      setCampaigns(data || []);
    } catch {
      toast("error", "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, [accounts]);

  const handleAccountChange = (customerId: string) => {
    setSelectedAccount(customerId);
    setCampaigns([]);
    if (customerId) loadCampaigns(customerId);
  };

  const openEdit = (campaign: any) => {
    setEditingCampaign(campaign);
    setConditions(campaign.removal_conditions || "");
  };

  const handleSave = async () => {
    if (!editingCampaign) return;
    setSaving(true);
    try {
      const account = accounts.find((a) => a.customer_id === selectedAccount);
      const workflow = account?.workflow || "workflow-0";
      const table = workflowTables[workflow] || "campaign_conditions";

      const { error } = await supabase
        .from(table)
        .update({ removal_conditions: conditions })
        .eq("customer_id", selectedAccount)
        .eq("campaign_name", editingCampaign.campaign_name);

      if (error) throw error;
      toast("success", "Conditions saved");
      setEditingCampaign(null);
      loadCampaigns(selectedAccount);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const filteredCampaigns = campaigns.filter(
    (c) => !search || c.campaign_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Campaigns</h1>
        <p className="text-sm text-gray-500">Manage campaign removal conditions</p>
      </div>

      {/* Account Selector */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Select
            label="Select Account"
            options={[
              { value: "", label: "Choose an account..." },
              ...accounts.map((a) => ({
                value: a.customer_id,
                label: `${a.customer_id} ${a.enabled ? "" : "(disabled)"}`,
              })),
            ]}
            value={selectedAccount}
            onChange={(e) => handleAccountChange(e.target.value)}
            className="flex-1 max-w-md"
          />
          {selectedAccount && (
            <SearchBar value={search} onChange={setSearch} placeholder="Filter campaigns..." className="flex-1 max-w-md" />
          )}
        </div>
      </Card>

      {/* Campaigns Table */}
      {selectedAccount && (
        <Card>
          {loading ? (
            <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Campaign Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Removal Conditions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCampaigns.map((c) => (
                    <tr key={c.campaign_name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {c.campaign_name}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                        <div className="line-clamp-2">{c.removal_conditions || "No conditions set"}</div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={c.enabled !== false ? "success" : "default"}>
                          {c.enabled !== false ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        No campaigns found for this account
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Edit Conditions Modal */}
      <Modal
        open={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        title={`Edit Conditions: ${editingCampaign?.campaign_name || ""}`}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Removal Conditions
            </label>
            <textarea
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              rows={8}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Enter removal conditions, one per line..."
            />
            <p className="mt-1 text-xs text-gray-500">Use bullet points (•) or newlines to separate conditions</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEditingCampaign(null)}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> Save Conditions
          </Button>
        </div>
      </Modal>
    </div>
  );
}
