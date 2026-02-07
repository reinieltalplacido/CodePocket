import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { apiKeyCache, snippetCache } from "@/lib/cache-utils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateApiKey(apiKey: string): Promise<string | null> {
  // Check cache first
  const cached = apiKeyCache.get(apiKey);
  if (cached) {
    return cached.userId;
  }

  // Query database
  const { data } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("api_key", apiKey)
    .single();

  if (data?.user_id) {
    // Cache the result
    apiKeyCache.set(apiKey, { userId: data.user_id });
    return data.user_id;
  }

  return null;
}

// GET /api/snippets/[id] - Get single snippet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const userId = await validateApiKey(apiKey);

  if (!userId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { id } = await params;

  // Check snippet cache
  const cacheKey = `snippet:${id}`;
  const cached = snippetCache.get(cacheKey);

  if (cached && cached.user_id === userId) {
    return NextResponse.json(
      { snippet: cached },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
          "X-Cache": "HIT",
        },
      },
    );
  }

  const { data, error } = await supabase
    .from("snippets")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  // Cache the result
  snippetCache.set(cacheKey, data);

  return NextResponse.json(
    { snippet: data },
    {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        "X-Cache": "MISS",
      },
    },
  );
}

// PUT /api/snippets/[id] - Update snippet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const userId = await validateApiKey(apiKey);

  if (!userId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, code, language, description, tags, folder_id } = body;

  const { data, error } = await supabase
    .from("snippets")
    .update({
      title,
      code,
      language,
      description,
      tags,
      folder_id,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Invalidate caches
  snippetCache.delete(`snippet:${id}`);
  snippetCache.delete(`snippets:list:${userId}`);

  return NextResponse.json({ snippet: data });
}

// DELETE /api/snippets/[id] - Delete snippet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  const userId = await validateApiKey(apiKey);

  if (!userId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from("snippets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Invalidate caches
  snippetCache.delete(`snippet:${id}`);
  snippetCache.delete(`snippets:list:${userId}`);

  return NextResponse.json({ success: true });
}
