import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((v) => (v || "").trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}

export async function GET() {
  const supabase = createServerClient();

  const [todosRes, packagesRes, configRes] = await Promise.all([
    supabase.from("todos").select("app_name,package_name,kpi_type,priority,status").limit(10000),
    supabase.from("packages").select("*").limit(10000),
    supabase
      .from("credentials")
      .select("name,value")
      .in("name", [
        "todo_ui_quick_filters",
        "todo_ui_smart_lists",
        "todo_ui_date_filters",
        "todo_ui_message_filters",
        "todo_ui_sort_options",
        "todo_ui_routing_modes",
      ]),
  ]);

  const todos = todosRes.data || [];
  const packageRows = packagesRes.error ? [] : (packagesRes.data || []);

  const fromPackages = packageRows.map((row: Record<string, unknown>) => ({
    app_name:
      (row.app_name as string | undefined) ||
      (row.app_game_name as string | undefined) ||
      (row.name as string | undefined) ||
      null,
    package_name:
      (row.package_name as string | undefined) ||
      (row.package as string | undefined) ||
      (row.bundle_id as string | undefined) ||
      null,
    kpi_type: (row.kpi_type as string | undefined) || null,
  }));

  const merged = [...todos, ...fromPackages];

  const appNames = uniqueSorted(merged.map((r: any) => r.app_name));
  const packageNames = uniqueSorted(merged.map((r: any) => r.package_name));
  const kpiTypes = uniqueSorted(merged.map((r: any) => r.kpi_type));
  const priorities = uniqueSorted(todos.map((r: any) => r.priority));
  const statuses = uniqueSorted(todos.map((r: any) => r.status));

  const appPackagePairs = merged
    .map((r: any) => ({ app_name: r.app_name || "", package_name: r.package_name || "" }))
    .filter((r) => r.app_name && r.package_name)
    .filter((r, i, arr) => arr.findIndex((x) => x.app_name === r.app_name && x.package_name === r.package_name) === i);

  const configMap = new Map<string, unknown>();
  (configRes.data || []).forEach((row: any) => {
    try {
      configMap.set(row.name, row.value ? JSON.parse(row.value) : []);
    } catch {
      configMap.set(row.name, []);
    }
  });

  return NextResponse.json({
    appNames,
    packageNames,
    kpiTypes,
    priorities,
    statuses,
    appPackagePairs,
    quickFilters: Array.isArray(configMap.get("todo_ui_quick_filters")) ? configMap.get("todo_ui_quick_filters") : [],
    smartLists: Array.isArray(configMap.get("todo_ui_smart_lists")) ? configMap.get("todo_ui_smart_lists") : [],
    dateFilters: Array.isArray(configMap.get("todo_ui_date_filters")) ? configMap.get("todo_ui_date_filters") : [],
    messageFilters: Array.isArray(configMap.get("todo_ui_message_filters")) ? configMap.get("todo_ui_message_filters") : [],
    sortOptions: Array.isArray(configMap.get("todo_ui_sort_options")) ? configMap.get("todo_ui_sort_options") : [],
    routingModes: Array.isArray(configMap.get("todo_ui_routing_modes")) ? configMap.get("todo_ui_routing_modes") : [],
  });
}
