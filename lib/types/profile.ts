// lib/types/profile.ts
// TypeScript types for user profiles

export type Profile = {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = {
  username?: string;
  display_name?: string;
  bio?: string;
};

export type UserWithProfile = {
  id: string;
  email: string;
  profile?: Profile;
};
