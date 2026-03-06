import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const username = searchParams.get("username");

  let query = supabase.from("looker_reports").select("*").order("name");

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by user access if username provided
  let reports = data || [];
  if (username) {
    reports = reports.filter((r: any) => {
      if (!r.allowed_users) return true;
      const allowed = r.allowed_users.split(",").map((u: string) => u.trim().toLowerCase());
      return allowed.includes(username.toLowerCase()) || allowed.includes("all");
    });
  }

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.name || !body.url) {
    return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("looker_reports").insert({
    name: body.name,
    url: body.url,
    description: body.description || null,
    allowed_users: body.allowed_users || null,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { id, ...updates } = body;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("looker_reports").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("looker_reports").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
