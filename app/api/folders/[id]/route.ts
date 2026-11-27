import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { emitVaultEvent } from "@/lib/realtime-bus";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const folder = await prisma.folder.findFirst({
    where: { id, userId: user.id },
  });

  if (!folder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  return NextResponse.json({
    folder: {
      id: folder.id,
      user_id: folder.userId,
      name: folder.name,
      description: folder.description,
      color: folder.color,
      created_at: folder.createdAt.toISOString(),
      updated_at: folder.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  await prisma.folder.updateMany({
    where: { id, userId: user.id },
    data: {
      name: body.name?.trim(),
      description: body.description !== undefined ? body.description?.trim() || null : undefined,
      color: body.color,
    },
  });

  emitVaultEvent(user.id, {
    resource: "folders",
    action: "updated",
    entityId: id,
    title: body.name?.trim(),
    source: "web",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.folder.deleteMany({
    where: { id, userId: user.id },
  });

  emitVaultEvent(user.id, {
    resource: "folders",
    action: "deleted",
    entityId: id,
    source: "web",
  });

  return NextResponse.json({ success: true });
}
