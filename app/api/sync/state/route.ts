import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    activeAgg,
    favoriteCount,
    archiveAgg,
    folderAgg,
    userRow,
    apiKeyCount,
  ] = await Promise.all([
    prisma.snippet.aggregate({
      where: { userId: authUser.id, deletedAt: null },
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    prisma.snippet.count({
      where: { userId: authUser.id, deletedAt: null, isFavorite: true },
    }),
    prisma.snippet.aggregate({
      where: { userId: authUser.id, deletedAt: { not: null } },
      _count: { _all: true },
      _max: { deletedAt: true, updatedAt: true },
    }),
    prisma.folder.aggregate({
      where: { userId: authUser.id },
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    prisma.user.findUnique({
      where: { id: authUser.id },
      select: { updatedAt: true },
    }),
    prisma.apiKey.count({
      where: { userId: authUser.id },
    }),
  ]);

  const fingerprint = [
    activeAgg._count._all,
    activeAgg._max.updatedAt?.getTime() ?? 0,
    favoriteCount,
    archiveAgg._count._all,
    archiveAgg._max.deletedAt?.getTime() ?? 0,
    archiveAgg._max.updatedAt?.getTime() ?? 0,
    folderAgg._count._all,
    folderAgg._max.updatedAt?.getTime() ?? 0,
    userRow?.updatedAt.getTime() ?? 0,
    apiKeyCount,
  ].join(":");

  return NextResponse.json({
    fingerprint,
    counts: {
      all: activeAgg._count._all,
      favorites: favoriteCount,
      archive: archiveAgg._count._all,
      folders: folderAgg._count._all,
    },
  });
}
