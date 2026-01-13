import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client for API routes and server components
 * Handles authentication with cookies automatically
 */

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated user from server-side
 */
export async function getServerUser() {
  const supabase = await createServerSupabaseClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

/**
 * Verify user owns a resource (for authorization checks)
 */
export async function verifyResourceOwnership(
  resourceType: 'snippet' | 'folder' | 'api_key',
  resourceId: string
): Promise<{ authorized: boolean; userId: string | null }> {
  const user = await getServerUser();
  
  if (!user) {
    return { authorized: false, userId: null };
  }

  const supabase = await createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from(resourceType === 'snippet' ? 'snippets' : resourceType === 'folder' ? 'folders' : 'api_keys')
      .select('user_id')
      .eq('id', resourceId)
      .single();

    if (error || !data) {
      return { authorized: false, userId: user.id };
    }

    return {
      authorized: data.user_id === user.id,
      userId: user.id,
    };
  } catch (error) {
    console.error('Error verifying resource ownership:', error);
    return { authorized: false, userId: user.id };
  }
}
