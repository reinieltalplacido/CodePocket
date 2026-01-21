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
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    // Get users with pagination
    const { data: users, count: totalUsers } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (!users) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    // Get snippet counts for each user
    const userIds = users.map(u => u.id);
    const { data: snippetCounts } = await supabase
      .from("snippets")
      .select("user_id")
      .in("user_id", userIds)
      .is("deleted_at", null);

    const snippetCountMap: Record<string, number> = {};
    snippetCounts?.forEach((s: any) => {
      snippetCountMap[s.user_id] = (snippetCountMap[s.user_id] || 0) + 1;
    });

    // Get group memberships for each user
    const { data: groupMemberships } = await supabase
      .from("group_members")
      .select("user_id")
      .in("user_id", userIds);

    const groupCountMap: Record<string, number> = {};
    groupMemberships?.forEach((gm: any) => {
      groupCountMap[gm.user_id] = (groupCountMap[gm.user_id] || 0) + 1;
    });

    // Enrich user data with email from auth if not in profile
    const enrichedUsers = users.map(user => ({
      id: user.id,
      email: user.email || user.id, // Use email from profile or fallback to ID
      username: user.username,
      created_at: user.created_at,
      snippet_count: snippetCountMap[user.id] || 0,
      group_count: groupCountMap[user.id] || 0,
    }));

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalUsers || 0,
        totalPages: Math.ceil((totalUsers || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
