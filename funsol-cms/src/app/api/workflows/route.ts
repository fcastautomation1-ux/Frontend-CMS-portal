import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("workflows").select("*").order("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { id, ...updates } = body;
  const { data, error } = await supabase.from("workflows").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
