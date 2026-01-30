import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// In-memory cache for API key validation (5 min TTL)
const apiKeyCache = new Map<string, { userId: string; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function validateApiKey(apiKey: string): Promise<string | null> {
  // Check cache first
  const cached = apiKeyCache.get(apiKey);
  if (cached && cached.expires > Date.now()) {
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
    apiKeyCache.set(apiKey, {
      userId: data.user_id,
      expires: Date.now() + CACHE_TTL
    });
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

  const { data, error } = await supabase
    .from("snippets")
    .select("id, title, code, language, description, tags, folder_id, source, created_at")
    .eq("user_id", userId)
    .is("deleted_at", null) // Exclude deleted snippets
    .order("created_at", { ascending: false })
    .limit(1000); // Reasonable limit to prevent huge responses

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ snippets: data || [] });
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
    validateApiKey(apiKey)
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
    source = "web"
  } = body;

  // Early validation
  if (!title || !code) {
    return NextResponse.json(
      { error: "Title and code are required" },
      { status: 400 }
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
      source
    })
    .select("id, title, language, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ snippet: data }, { status: 201 });
}
