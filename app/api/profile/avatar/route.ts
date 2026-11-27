import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { formatProfileRecord } from "@/lib/formatters";
import { emitVaultEvent } from "@/lib/realtime-bus";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: { image: dataUrl },
    });

    emitVaultEvent(authUser.id, {
      resource: "profile",
      action: "updated",
      entityId: updated.id,
      title: "Profile avatar",
      source: "web",
    });

    return NextResponse.json({
      success: true,
      avatar_url: dataUrl,
      profile: formatProfileRecord(updated),
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload avatar" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: { image: null },
    });

    emitVaultEvent(authUser.id, {
      resource: "profile",
      action: "updated",
      entityId: updated.id,
      title: "Profile avatar",
      source: "web",
    });

    return NextResponse.json({
      success: true,
      profile: formatProfileRecord(updated),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
