import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const unreadOnly = searchParams.get("unread") === "true";

  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (username) query = query.eq("username", username);
  if (unreadOnly) query = query.eq("read", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.username || !body.message) {
    return NextResponse.json({ error: "username and message are required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("notifications").insert({
    username: body.username,
    message: body.message,
    type: body.type || "info",
    read: false,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  // Mark all as read
  if (body.markAllRead && body.username) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("username", body.username)
      .eq("read", false);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Mark single as read
  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
