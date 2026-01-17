// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // If profile doesn't exist, create it (for existing users)
    if (!profile && !profileError) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      profile = newProfile;
    } else if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Add user's actual account creation date from auth.users
    const profileWithUserData = {
      ...profile,
      created_at: user.created_at, // Use auth.users created_at instead of profiles created_at
    };

    return NextResponse.json({ profile: profileWithUserData });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, display_name, bio } = body;

    // Validate username format if provided
    if (username !== undefined) {
      if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return NextResponse.json(
          {
            error:
              "Username must be 3-20 characters and contain only letters, numbers, and underscores",
          },
          { status: 400 }
        );
      }

      // Check username uniqueness (case-insensitive)
      if (username) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("user_id")
          .ilike("username", username)
          .neq("user_id", user.id)
          .maybeSingle();

        if (existingProfile) {
          return NextResponse.json(
            { error: "Username is already taken" },
            { status: 409 }
          );
        }
      }
    }

    // Check if profile exists, create if not
    let { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: createError } = await supabase
        .from("profiles")
        .insert({ user_id: user.id });

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }
    }

    // Update profile
    const updateData: any = {};
    if (username !== undefined) updateData.username = username?.toLowerCase() || null;
    if (display_name !== undefined) updateData.display_name = display_name || null;
    if (bio !== undefined) updateData.bio = bio || null;

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
