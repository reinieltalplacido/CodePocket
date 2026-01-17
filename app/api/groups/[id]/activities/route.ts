// app/api/groups/[id]/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    
    // Get auth token from header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create Supabase client with service role for RLS bypass
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is a member of the group
    const { data: membership } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this group" },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const activityType = searchParams.get("type");

    // Build query - fetch activities without joins first
    let query = supabase
      .from("group_activities")
      .select(`
        id,
        group_id,
        activity_type,
        actor_id,
        target_id,
        metadata,
        created_at
      `)
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Add type filter if specified
    if (activityType) {
      query = query.eq("activity_type", activityType);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error("Error fetching activities:", error);
      return NextResponse.json(
        { error: "Failed to fetch activities" },
        { status: 500 }
      );
    }

    // Fetch user profiles for actors and targets
    if (activities && activities.length > 0) {
      const userIds = new Set<string>();
      activities.forEach((activity: any) => {
        if (activity.actor_id) userIds.add(activity.actor_id);
        if (activity.target_id) userIds.add(activity.target_id);
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", Array.from(userIds));

      const { data: users } = await supabase.auth.admin.listUsers();
      
      // Create a map of user profiles
      const profileMap = new Map();
      profiles?.forEach((profile: any) => {
        profileMap.set(profile.user_id, profile);
      });

      // Create a map of user emails
      const userMap = new Map();
      users.users?.forEach((user: any) => {
        userMap.set(user.id, user);
      });

      // Populate activities with user data
      const populatedActivities = activities.map((activity: any) => ({
        ...activity,
        actor: activity.actor_id ? {
          id: activity.actor_id,
          email: userMap.get(activity.actor_id)?.email || null,
          profiles: profileMap.get(activity.actor_id) || null,
        } : null,
        target: activity.target_id ? {
          id: activity.target_id,
          email: userMap.get(activity.target_id)?.email || null,
          profiles: profileMap.get(activity.target_id) || null,
        } : null,
      }));

      return NextResponse.json({
        activities: populatedActivities,
        count: populatedActivities.length,
        limit,
        offset,
      });
    }

    return NextResponse.json({
      activities: activities || [],
      count: activities?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error in activities route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
