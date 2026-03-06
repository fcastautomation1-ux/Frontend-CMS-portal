import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account_id");
  const table = searchParams.get("table") || "campaign_conditions";

  // Validate table name to prevent injection
  const allowedTables = ["campaign_conditions", "workflow_1", "workflow_2", "workflow_3"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  let query = supabase.from(table).select("*").order("id");
  if (accountId) query = query.eq("account_id", accountId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  const table = body.table || "campaign_conditions";
  const allowedTables = ["campaign_conditions", "workflow_1", "workflow_2", "workflow_3"];
  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { id, table: _, ...updates } = body;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from(table).update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
