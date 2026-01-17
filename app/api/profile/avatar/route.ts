// app/api/profile/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    // Get current profile to check for existing avatar
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .single();

    // Delete old avatar if exists
    if (currentProfile?.avatar_url) {
      const oldPath = currentProfile.avatar_url.split("/").pop();
      if (oldPath) {
        await supabase.storage
          .from("avatars")
          .remove([`${user.id}/${oldPath}`]);
      }
    }

    // Upload new avatar
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // Check if it's a bucket not found error
      if (uploadError.message.includes("Bucket not found")) {
        return NextResponse.json(
          { 
            error: "Avatar storage not configured. Please create an 'avatars' bucket in Supabase Storage with public access enabled. See setup guide for instructions." 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Update profile with new avatar URL
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile, avatar_url: publicUrl });
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get current profile
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", user.id)
      .single();

    // Delete avatar from storage if exists
    if (currentProfile?.avatar_url) {
      const oldPath = currentProfile.avatar_url.split("/").pop();
      if (oldPath) {
        await supabase.storage
          .from("avatars")
          .remove([`${user.id}/${oldPath}`]);
      }
    }

    // Update profile to remove avatar URL
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
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
    console.error("Error deleting avatar:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
