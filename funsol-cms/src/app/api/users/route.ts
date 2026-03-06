import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const search = searchParams.get("search");

  let query = supabase.from("users").select("*").order("username");

  if (role) query = query.eq("role", role);
  if (search) query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Strip passwords from response
  const safe = (data || []).map(({ password: _password, ...rest }) => rest);
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.username || !body.password || !body.role) {
    return NextResponse.json({ error: "username, password, and role are required" }, { status: 400 });
  }

  // Check if user already exists
  const { data: existing } = await supabase
    .from("users")
    .select("username")
    .eq("username", body.username)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Username already exists" }, { status: 409 });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(body.password, 12);

  const userData = {
    username: body.username,
    password: hashedPassword,
    role: body.role,
    email: body.email || null,
    department: body.department || null,
    manager_id: body.manager_id || null,
    team_members: body.team_members || null,
    drive_access_level: body.drive_access_level || "none",
    allowed_accounts: body.allowed_accounts || null,
    allowed_drive_folders: body.allowed_drive_folders || null,
    allowed_campaigns: body.allowed_campaigns || null,
    allowed_looker_reports: body.allowed_looker_reports || null,
    module_access: body.module_access || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("users").insert(userData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { password: _, ...safe } = data;
  return NextResponse.json(safe, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const updates: any = { ...body, updated_at: new Date().toISOString() };
  delete updates.username; // Don't update primary key

  // Hash password if provided
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 12);
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("username", body.username)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { password: _, ...safe } = data;
  return NextResponse.json(safe);
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  // Prevent admin self-delete
  if (username === "admin") {
    return NextResponse.json({ error: "Cannot delete admin user" }, { status: 403 });
  }

  const { error } = await supabase.from("users").delete().eq("username", username);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
