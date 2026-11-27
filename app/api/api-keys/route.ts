import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { emitVaultEvent } from "@/lib/realtime-bus";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const formatted = keys.map((k) => ({
    id: k.id,
    user_id: k.userId,
    name: k.name || "Default Key",
    api_key: k.apiKey,
    created_at: k.createdAt.toISOString(),
    last_used_at: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
  }));

  return NextResponse.json({ keys: formatted });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const keyName = body.name || body.key_name || "New API Key";

  // Use client-supplied key or generate a secure API key
  const rawKey = body.api_key || `cpk_${crypto.randomBytes(24).toString("hex")}`;

  const created = await prisma.apiKey.create({
    data: {
      userId: user.id,
      apiKey: rawKey,
      name: keyName,
    },
  });

  emitVaultEvent(user.id, {
    resource: "api-keys",
    action: "created",
    entityId: created.id,
    title: created.name || "API Key",
    source: "web",
  });

  return NextResponse.json(
    {
      key: {
        id: created.id,
        user_id: created.userId,
        name: created.name,
        api_key: created.apiKey,
        created_at: created.createdAt.toISOString(),
        last_used_at: null,
      },
    },
    { status: 201 },
  );
}
