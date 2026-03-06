import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const todoId = searchParams.get("todo_id");

  let query = supabase.from("todo_shares").select("*").order("created_at", { ascending: false });
  if (todoId) query = query.eq("todo_id", todoId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.todo_id || !body.shared_with || !body.shared_by) {
    return NextResponse.json({ error: "todo_id, shared_by, and shared_with are required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("todo_shares").insert({
    todo_id: body.todo_id,
    shared_by: body.shared_by,
    shared_with: body.shared_with,
    can_edit: body.can_edit || false,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("todo_shares").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
