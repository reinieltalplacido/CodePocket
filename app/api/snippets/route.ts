import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateApiKey(apiKey: string) {
  const { data } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("api_key", apiKey)
    .single();

  return data?.user_id || null;
}

// GET /api/snippets
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const userId = await validateApiKey(apiKey);

  if (!userId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("snippets")
    // include all fields you need on cards (add folder_name if you have it)
    .select("id, title, code, language, description, tags, folder_id, source, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ snippets: data });
}

// POST /api/snippets (used by VS Code and web)
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const userId = await validateApiKey(apiKey);

  if (!userId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    code,
    language,
    description,
    tags,
    folder_id,
    source = "web" // default when not provided
  } = body;

  if (!title || !code) {
    return NextResponse.json(
      { error: "Title and code are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("snippets")
    .insert({
      user_id: userId,
      title,
      code,
      language,
      description,
      tags,
      folder_id,
      source
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ snippet: data }, { status: 201 });
}
