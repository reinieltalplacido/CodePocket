import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return { valid: false, userId: null };
  }

  const { data } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("api_key", apiKey)
    .single();

  if (!data) {
    return { valid: false, userId: null };
  }

  return { valid: true, userId: data.user_id };
}
