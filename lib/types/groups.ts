// lib/types/groups.ts
// TypeScript types for the groups feature

export type Group = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  // Joined user data
  users?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
  // Joined profile data
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
};

export type GroupInvitation = {
  id: string;
  group_id: string;
  inviter_id: string;
  email: string;
  invite_code: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  expires_at: string;
  // Joined data
  groups?: Group;
  inviter?: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
};

export type GroupSnippet = {
  id: string;
  group_id: string;
  snippet_id: string;
  shared_by: string;
  shared_at: string;
  // Joined snippet data
  snippets?: {
    id: string;
    title: string;
    description: string | null;
    code: string;
    language: string;
    tags: string[] | null;
    created_at: string;
    user_id: string;
  };
};

export type GroupFolder = {
  id: string;
  group_id: string;
  name: string;
  color: string;
  created_by: string;
  created_at: string;
};

export type GroupWithMembers = Group & {
  member_count?: number;
  is_owner?: boolean;
  members?: GroupMember[];
};

export type GroupSettings = {
  name: string;
  description: string | null;
};

export type ActivityType =
  | 'group_created'
  | 'group_updated'
  | 'group_deleted'
  | 'member_joined'
  | 'member_left'
  | 'member_invited'
  | 'member_removed'
  | 'snippet_shared'
  | 'snippet_removed';

export type ActivityMetadata = {
  group_name?: string;
  snippet_id?: string;
  snippet_title?: string;
  snippet_language?: string;
  invite_email?: string;
  [key: string]: any;
};

export type GroupActivity = {
  id: string;
  group_id: string;
  activity_type: ActivityType;
  actor_id: string | null;
  target_id: string | null;
  metadata: ActivityMetadata;
  created_at: string;
  // Joined actor data
  actor?: {
    id: string;
    email: string;
    profiles?: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    };
  };
  // Joined target data
  target?: {
    id: string;
    email: string;
    profiles?: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    };
  };
};

