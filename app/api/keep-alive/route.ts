import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Keep-alive endpoint to prevent Supabase free tier from pausing.
 * Called every 5 days via Vercel Cron (configured in vercel.json).
 *
 * Secured with CRON_SECRET to prevent unauthorized calls.
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Lightweight ping — just check Supabase is reachable
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      console.error("[keep-alive] Supabase ping failed:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    console.log(
      "[keep-alive] Supabase pinged successfully at",
      new Date().toISOString(),
    );
    return NextResponse.json({
      success: true,
      message: "Supabase keep-alive ping successful",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[keep-alive] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 },
    );
  }
}
