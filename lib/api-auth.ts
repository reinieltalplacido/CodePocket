import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { apiKeyCache } from "@/lib/cache-utils";

export async function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return { valid: false, userId: null };
  }

  const cached = apiKeyCache.get(apiKey);
  if (cached) {
    void touchApiKeyLastUsed(apiKey);
    return { valid: true, userId: cached.userId };
  }

  const record = await prisma.apiKey.findUnique({
    where: { apiKey },
    select: { userId: true },
  });

  if (!record) {
    return { valid: false, userId: null };
  }

  apiKeyCache.set(apiKey, { userId: record.userId });
  void touchApiKeyLastUsed(apiKey);
  return { valid: true, userId: record.userId };
}

export async function resolveRequestUserId(request: NextRequest): Promise<string | null> {
  const authUser = await getAuthenticatedUser();
  if (authUser?.id) return authUser.id;

  const apiKeyResult = await validateApiKey(request);
  return apiKeyResult.valid ? apiKeyResult.userId : null;
}

async function touchApiKeyLastUsed(apiKey: string) {
  try {
    await prisma.apiKey.updateMany({
      where: { apiKey },
      data: { lastUsedAt: new Date() },
    });
  } catch {
    // Non-critical usage timestamp update
  }
}
