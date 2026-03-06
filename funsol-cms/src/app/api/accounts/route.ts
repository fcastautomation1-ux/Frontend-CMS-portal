import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabase.from("accounts").select("*").order("customer_id");

  if (status === "enabled") query = query.eq("enabled", true);
  if (status === "disabled") query = query.eq("enabled", false);
  if (search) query = query.ilike("customer_id", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.customer_id) {
    return NextResponse.json({ error: "customer_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("accounts").insert({
    customer_id: body.customer_id,
    google_sheet_link: body.google_sheet_link || null,
    drive_comment: body.drive_comment || null,
    code_comment: body.code_comment || null,
    workflow: body.workflow || "default",
    enabled: body.enabled ?? true,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  // Batch enable/disable
  if (body.ids && typeof body.enabled === "boolean") {
    const { error } = await supabase
      .from("accounts")
      .update({ enabled: body.enabled, updated_at: new Date().toISOString() })
      .in("id", body.ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { id, ...updates } = body;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("accounts").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
