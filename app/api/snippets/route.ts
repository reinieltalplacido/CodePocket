import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRequestUserId } from "@/lib/api-auth";
import { snippetCache } from "@/lib/cache-utils";
import { formatSnippetRecord } from "@/lib/formatters";
import { emitVaultEvent } from "@/lib/realtime-bus";

// GET /api/snippets
export async function GET(request: NextRequest) {
  const userId = await resolveRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folder_id");
  const isFavorite = searchParams.get("is_favorite");
  const includeDeleted = searchParams.get("deleted") === "true";

  const whereClause: {
    userId: string;
    deletedAt: null | { not: null };
    folderId?: string;
    isFavorite?: boolean;
  } = {
    userId,
    deletedAt: includeDeleted ? { not: null } : null,
  };

  if (folderId) {
    whereClause.folderId = folderId;
  }

  if (isFavorite === "true") {
    whereClause.isFavorite = true;
  }

  const snippets = await prisma.snippet.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      folder: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    take: 1000,
  });

  return NextResponse.json({ snippets: snippets.map(formatSnippetRecord) });
}

// POST /api/snippets
export async function POST(request: NextRequest) {
  const userId = await resolveRequestUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const inferredSource = request.headers.get("x-api-key") ? "vscode" : "web";
  const {
    title,
    code,
    language,
    description,
    tags,
    folder_id,
    source = inferredSource,
  } = body;

  if (!title || !code) {
    return NextResponse.json(
      { error: "Title and code are required" },
      { status: 400 },
    );
  }

  const snippet = await prisma.snippet.create({
    data: {
      userId,
      title,
      code,
      language: language || "JavaScript",
      description: description || null,
      tags: Array.isArray(tags) ? tags : [],
      folderId: folder_id || null,
      source,
    },
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

  emitVaultEvent(userId, {
    resource: "snippets",
    action: "created",
    entityId: snippet.id,
    title: snippet.title,
    source: snippet.source ?? inferredSource,
  });

  return NextResponse.json(
    { snippet: formatSnippetRecord(snippet) },
    { status: 201 },
  );
}
