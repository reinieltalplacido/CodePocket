import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

const getBaseURL = () => {
  const isVercel = Boolean(process.env.VERCEL);

  if (process.env.BETTER_AUTH_URL && (!isVercel || !process.env.BETTER_AUTH_URL.includes('localhost'))) {
    return process.env.BETTER_AUTH_URL;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && (!isVercel || !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (isVercel) {
    return 'https://code-pocket.vercel.app';
  }
  return 'http://localhost:3000';
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET || 'codepocket_better_auth_secret_secure_key_2026_99x',
  baseURL: getBaseURL(),
  trustedOrigins: [
    'https://code-pocket.vercel.app',
    'http://localhost:3000',
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      prompt: 'select_account',
      accessType: 'offline',
    },
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: false,
      },
      bio: {
        type: 'string',
        required: false,
      },
    },
  },
});
