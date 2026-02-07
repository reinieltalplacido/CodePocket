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
    .limit(1)
    .single();

  if (data?.user_id) {
    // Cache the result
    apiKeyCache.set(apiKey, { userId: data.user_id });
    return data.user_id;
  }

  return null;
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

  // Check snippet list cache
  const cacheKey = `snippets:list:${userId}`;
  const cached = snippetCache.get(cacheKey);

  if (cached) {
    return NextResponse.json(
      { snippets: cached },
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
    .select(
      "id, title, code, language, description, tags, folder_id, source, created_at",
    )
    .eq("user_id", userId)
    .is("deleted_at", null) // Exclude deleted snippets
    .order("created_at", { ascending: false })
    .limit(1000); // Reasonable limit to prevent huge responses

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Cache the result
  snippetCache.set(cacheKey, data || []);

  return NextResponse.json(
    { snippets: data || [] },
    {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        "X-Cache": "MISS",
      },
    },
  );
}

// POST /api/snippets (used by VS Code and web)
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 401 });
  }

  // Parse body and validate API key in parallel
  const [body, userId] = await Promise.all([
    request.json(),
    validateApiKey(apiKey),
  ]);

  if (!userId) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const {
    title,
    code,
    language,
    description,
    tags,
    folder_id,
    source = "web",
  } = body;

  // Early validation
  if (!title || !code) {
    return NextResponse.json(
      { error: "Title and code are required" },
      { status: 400 },
    );
  }

  // Optimized insert - only select necessary fields
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
      source,
    })
    .select("id, title, language, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Invalidate snippet list cache for this user
  snippetCache.delete(`snippets:list:${userId}`);

  return NextResponse.json({ snippet: data }, { status: 201 });
}
