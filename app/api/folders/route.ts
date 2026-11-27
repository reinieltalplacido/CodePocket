import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { emitVaultEvent } from "@/lib/realtime-bus";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const folders = await prisma.folder.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          snippets: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  const formatted = folders.map((f) => ({
    id: f.id,
    user_id: f.userId,
    name: f.name,
    description: f.description,
    color: f.color,
    snippet_count: f._count.snippets,
    created_at: f.createdAt.toISOString(),
    updated_at: f.updatedAt.toISOString(),
  }));

  return NextResponse.json({ folders: formatted });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, color } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
  }

  const folder = await prisma.folder.create({
    data: {
      userId: user.id,
      name: name.trim(),
      description: description ? description.trim() : null,
      color: color || "emerald",
    },
  });

  emitVaultEvent(user.id, {
    resource: "folders",
    action: "created",
    entityId: folder.id,
    title: folder.name,
    source: "web",
  });

  return NextResponse.json(
    {
      folder: {
        id: folder.id,
        user_id: folder.userId,
        name: folder.name,
        description: folder.description,
        color: folder.color,
        snippet_count: 0,
        created_at: folder.createdAt.toISOString(),
        updated_at: folder.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
