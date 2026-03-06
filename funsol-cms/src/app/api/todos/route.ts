import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");

  let query = supabase.from("todos").select("*").order("created_at", { ascending: false });

  if (username) query = query.eq("username", username);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.title || !body.username) {
    return NextResponse.json({ error: "title and username are required" }, { status: 400 });
  }

  const todo = {
    title: body.title,
    description: body.description || null,
    status: body.status || "open",
    priority: body.priority || "medium",
    username: body.username,
    assigned_to: body.assigned_to || null,
    due_date: body.due_date || null,
    category: body.category || null,
    tags: body.tags || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("todos").insert(todo).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { id, ...updates } = body;
  updates.updated_at = new Date().toISOString();

  if (updates.status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase.from("todos").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  // Also delete shares
  await supabase.from("todo_shares").delete().eq("todo_id", id);
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
