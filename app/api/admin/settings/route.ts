import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function GET(request: NextRequest) {
  try {
    // Verify admin password
    const password = request.headers.get("x-admin-password");
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    // Get database statistics
    const { count: totalLogs } = await supabase
      .from("logs")
      .select("*", { count: "exact", head: true });

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: totalSnippets } = await supabase
      .from("snippets")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null);

    const { count: totalGroups } = await supabase
      .from("groups")
      .select("*", { count: "exact", head: true });

    // Get oldest log for uptime calculation
    const { data: oldestLog } = await supabase
      .from("logs")
      .select("created_at")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    const uptime = oldestLog
      ? Math.floor((Date.now() - new Date(oldestLog.created_at).getTime()) / 1000 / 60 / 60 / 24)
      : 0;

    return NextResponse.json({
      system: {
        appVersion: "1.0.0",
        databaseStatus: "healthy",
        uptime: `${uptime} days`,
        totalLogs: totalLogs || 0,
        totalUsers: totalUsers || 0,
        totalSnippets: totalSnippets || 0,
        totalGroups: totalGroups || 0,
      },
      security: {
        adminPasswordSet: !!process.env.ADMIN_PASSWORD,
        sessionTimeout: "24 hours",
      },
    });
  } catch (error) {
    console.error("Settings API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin password
    const password = request.headers.get("x-admin-password");
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const supabase = await createServerSupabaseClient();

    switch (action) {
      case "clear_old_logs": {
        // Delete logs older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { error } = await supabase
          .from("logs")
          .delete()
          .lt("created_at", thirtyDaysAgo.toISOString());

        if (error) throw error;
        return NextResponse.json({ success: true, message: "Old logs cleared" });
      }

      case "clear_deleted_snippets": {
        // Permanently delete soft-deleted snippets older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { error } = await supabase
          .from("snippets")
          .delete()
          .not("deleted_at", "is", null)
          .lt("deleted_at", thirtyDaysAgo.toISOString());

        if (error) throw error;
        return NextResponse.json({ success: true, message: "Deleted snippets cleared" });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Settings action error:", error);
    return NextResponse.json(
      { error: "Failed to perform action" },
      { status: 500 }
    );
  }
}
