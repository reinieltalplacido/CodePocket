export function formatProfileRecord(user: {
  id: string;
  username: string | null;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    user_id: user.id,
    username: user.username || user.email.split("@")[0],
    display_name: user.name || user.username || user.email.split("@")[0],
    avatar_url: user.image,
    bio: user.bio,
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt.toISOString(),
  };
}

export function formatSnippetRecord(s: {
  id: string;
  userId: string;
  title: string;
  code: string;
  language: string;
  description: string | null;
  tags: string[];
  folderId: string | null;
  isFavorite: boolean;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  folder?: { id: string; name: string; color: string } | null;
}) {
  return {
    id: s.id,
    user_id: s.userId,
    title: s.title,
    code: s.code,
    language: s.language,
    description: s.description,
    tags: s.tags,
    folder_id: s.folderId,
    is_favorite: s.isFavorite,
    source: s.source,
    created_at: s.createdAt.toISOString(),
    updated_at: s.updatedAt.toISOString(),
    deleted_at: s.deletedAt ? s.deletedAt.toISOString() : null,
    folders: s.folder ?? null,
  };
}
