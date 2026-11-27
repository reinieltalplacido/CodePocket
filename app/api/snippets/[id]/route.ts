import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestUserId } from "@/lib/api-auth";
import { snippetCache } from "@/lib/cache-utils";
import { formatSnippetRecord } from "@/lib/formatters";
import { emitVaultEvent } from "@/lib/realtime-bus";

// GET /api/snippets/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const snippet = await prisma.snippet.findFirst({
    where: { id, userId },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  if (!snippet) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  return NextResponse.json({ snippet: formatSnippetRecord(snippet) });
}

// PUT /api/snippets/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleUpdate(request, params);
}

// PATCH /api/snippets/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: NextRequest,
  paramsPromise: Promise<{ id: string }>,
) {
  const userId = await resolveRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await paramsPromise;
  const body = await request.json();

  const dataToUpdate: {
    title?: string;
    code?: string;
    language?: string;
    description?: string | null;
    tags?: string[];
    folderId?: string | null;
    isFavorite?: boolean;
    deletedAt?: Date | null;
  } = {};
  if (body.title !== undefined) dataToUpdate.title = body.title;
  if (body.code !== undefined) dataToUpdate.code = body.code;
  if (body.language !== undefined) dataToUpdate.language = body.language;
  if (body.description !== undefined) dataToUpdate.description = body.description;
  if (body.tags !== undefined) dataToUpdate.tags = body.tags;
  if (body.folder_id !== undefined) dataToUpdate.folderId = body.folder_id;
  if (body.is_favorite !== undefined) dataToUpdate.isFavorite = body.is_favorite;
  if (body.deleted_at !== undefined) {
    dataToUpdate.deletedAt = body.deleted_at ? new Date(body.deleted_at) : null;
  }

  const updated = await prisma.snippet.updateMany({
    where: { id, userId },
    data: dataToUpdate,
  });

  if (updated.count === 0) {
    return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
  }

  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  snippetCache.clear();

  const source = request.headers.get("x-api-key") ? "vscode" : "web";
  const action =
    body.deleted_at === null
      ? "restored"
      : body.deleted_at
        ? "deleted"
        : body.is_favorite !== undefined && Object.keys(body).length === 1
          ? "favorite"
          : "updated";

  emitVaultEvent(userId, {
    resource: "snippets",
    action,
    entityId: id,
    title: snippet?.title,
    source,
  });

  return NextResponse.json({ snippet: formatSnippetRecord(snippet!) });
}

// DELETE /api/snippets/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get("permanent") === "true";

  const existing = await prisma.snippet.findFirst({
    where: { id, userId },
    select: { title: true },
  });

  if (permanent) {
    await prisma.snippet.deleteMany({
      where: { id, userId },
    });
  } else {
    await prisma.snippet.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  snippetCache.clear();

  emitVaultEvent(userId, {
    resource: "snippets",
    action: permanent ? "purged" : "deleted",
    entityId: id,
    title: existing?.title,
    source: request.headers.get("x-api-key") ? "vscode" : "web",
  });

  return NextResponse.json({ success: true });
}
