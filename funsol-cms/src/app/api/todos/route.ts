import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const assignedTo = searchParams.get("assigned_to");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");
  const limit = Number(searchParams.get("limit") || "0");

  let query = supabase.from("todos").select("*").order("created_at", { ascending: false });

  if (username) query = query.eq("username", username);
  if (assignedTo) query = query.eq("assigned_to", assignedTo);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%,tags.ilike.%${search}%`);
  if (limit > 0) query = query.limit(limit);

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

  const now = new Date().toISOString();

  const todo = {
    title: body.title,
    description: body.description || null,
    status: body.status || "open",
    task_status: body.task_status || (body.assigned_to ? "backlog" : "todo"),
    priority: body.priority || "medium",
    username: body.username,
    assigned_to: body.assigned_to || null,
    manager_id: body.manager_id || null,
    due_date: body.due_date || null,
    expected_due_date: body.expected_due_date || null,
    actual_due_date: body.actual_due_date || null,
    category: body.category || null,
    tags: body.tags || null,
    notes: body.notes || null,
    our_goal: body.our_goal || null,
    kpi_type: body.kpi_type || null,
    queue_department: body.queue_department || null,
    queue_status: body.queue_status || null,
    approval_status: body.approval_status || "approved",
    completed: body.completed ?? false,
    created_at: now,
    updated_at: now,
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
  const now = new Date().toISOString();
  updates.updated_at = now;

  if (updates.status === "completed" && !updates.completed_at) {
    updates.completed_at = now;
  }

  if (updates.completed === true && !updates.completed_at) {
    updates.completed_at = now;
  }

  if (updates.completed === false) {
    updates.completed_at = null;
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
