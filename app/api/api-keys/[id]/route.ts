import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { apiKeyCache } from "@/lib/cache-utils";
import { emitVaultEvent } from "@/lib/realtime-bus";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.apiKey.deleteMany({
    where: { id, userId: user.id },
  });

  apiKeyCache.clear();

  emitVaultEvent(user.id, {
    resource: "api-keys",
    action: "deleted",
    entityId: id,
    source: "web",
  });

  return NextResponse.json({ success: true });
}
