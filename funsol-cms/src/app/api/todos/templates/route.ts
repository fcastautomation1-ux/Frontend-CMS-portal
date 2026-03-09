import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function keyFor(username: string, id: string) {
  return `todo_template::${username}::${id}`;
}

export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("credentials")
    .select("id,name,value,updated_at")
    .ilike("name", `todo_template::${username}::%`)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const templates = (data || []).map((row: any) => {
    let parsed: any = {};
    try {
      parsed = row.value ? JSON.parse(row.value) : {};
    } catch {
      parsed = {};
    }

    const templateId = String(row.name || "").split("::").pop() || "";

    return {
      id: templateId,
      name: parsed.name || templateId,
      form: parsed.form || {},
      updated_at: row.updated_at || null,
    };
  });

  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  const username = String(body.username || "").trim().toLowerCase();
  const id = String(body.id || "").trim();
  const name = String(body.name || "").trim();
  const form = body.form || {};

  if (!username || !id || !name) {
    return NextResponse.json({ error: "username, id, and name are required" }, { status: 400 });
  }

  const payload = {
    name: keyFor(username, id),
    value: JSON.stringify({ name, form }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("credentials")
    .upsert(payload, { onConflict: "name" })
    .select("name,value,updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    id,
    name,
    form,
    updated_at: data.updated_at,
  });
}

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim().toLowerCase();
  const id = (searchParams.get("id") || "").trim();

  if (!username || !id) {
    return NextResponse.json({ error: "username and id are required" }, { status: 400 });
  }

  const { error } = await supabase.from("credentials").delete().eq("name", keyFor(username, id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
