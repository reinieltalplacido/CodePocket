import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { formatProfileRecord } from "@/lib/formatters";
import { emitVaultEvent } from "@/lib/realtime-bus";

export async function GET() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile: formatProfileRecord(user) });
}

export async function PATCH(request: NextRequest) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, display_name, bio } = body;

    const normalizedUsername =
      username !== undefined ? (username?.trim() || null) : undefined;

    if (normalizedUsername && !/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      return NextResponse.json(
        { error: "Username must be 3-20 lowercase letters, numbers, or underscores" },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(normalizedUsername !== undefined ? { username: normalizedUsername } : {}),
        ...(display_name !== undefined && display_name !== null
          ? { name: display_name.trim() || authUser.name }
          : {}),
        ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
      },
    });

    emitVaultEvent(authUser.id, {
      resource: "profile",
      action: "updated",
      entityId: updated.id,
      title: updated.name,
      source: "web",
    });

    return NextResponse.json({ profile: formatProfileRecord(updated) });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 },
    );
  }
}
