import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

  // Filter out benign idle connection closes from Neon serverless pooler
  client.$on('error' as never, (e: any) => {
    if (e.message?.includes('kind: Closed') || e.message?.includes('closed')) {
      // Benign: Neon PgBouncer closes idle connections when inactive.
      return;
    }
    console.error('Prisma error:', e.message);
  });

  return client;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
