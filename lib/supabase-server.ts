import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/server-auth';

export async function createServerSupabaseClient() {
  return {
    auth: {
      getUser: async () => {
        const user = await getAuthenticatedUser();
        return { data: { user }, error: null };
      },
    },
  };
}

export async function getServerUser() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      username: user.username,
      name: user.name,
    },
  };
}

export async function verifyResourceOwnership(
  resourceType: 'snippet' | 'folder' | 'api_key',
  resourceId: string
): Promise<{ authorized: boolean; userId: string | null }> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { authorized: false, userId: null };
  }

  try {
    let ownerId: string | null = null;
    if (resourceType === 'snippet') {
      const res = await prisma.snippet.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });
      ownerId = res?.userId ?? null;
    } else if (resourceType === 'folder') {
      const res = await prisma.folder.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });
      ownerId = res?.userId ?? null;
    } else if (resourceType === 'api_key') {
      const res = await prisma.apiKey.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });
      ownerId = res?.userId ?? null;
    }

    return {
      authorized: ownerId === user.id,
      userId: user.id,
    };
  } catch (error) {
    console.error('Error verifying resource ownership:', error);
    return { authorized: false, userId: user.id };
  }
}
