// app/api/groups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/groups
 * List all groups the authenticated user is a member of
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Try to get user from Authorization header first
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }
    
    // Fallback to cookie-based auth
    if (!user) {
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && cookieUser) {
        user = cookieUser;
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role client to bypass RLS
    const { createClient } = await import('@supabase/supabase-js');
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get all groups where user is a member
    // First get group IDs where user is a member
    const { data: memberGroups } = await serviceClient
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);
    
    const memberGroupIds = memberGroups?.map(m => m.group_id) || [];
    
    // Then fetch groups where user is owner OR member
    const { data: groups, error } = await serviceClient
      .from('groups')
      .select(`
        *,
        member_count:group_members(count)
      `)
      .or(`owner_id.eq.${user.id}${memberGroupIds.length > 0 ? `,id.in.(${memberGroupIds.join(',')})` : ''}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json(
        { error: 'Failed to fetch groups' },
        { status: 500 }
      );
    }

    // Add is_owner flag to each group
    const groupsWithOwnership = groups?.map(group => ({
      ...group,
      is_owner: group.owner_id === user.id,
      member_count: group.member_count?.[0]?.count || 0
    })) || [];

    return NextResponse.json({ groups: groupsWithOwnership });
  } catch (error) {
    console.error('Error in GET /api/groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Try to get user from Authorization header first
    const authHeader = request.headers.get('authorization');
    let user = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }
    
    // Fallback to cookie-based auth
    if (!user) {
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && cookieUser) {
        user = cookieUser;
      }
    }
    
    console.log('POST /api/groups - Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      method: authHeader ? 'token' : 'cookie',
    });
    
    if (!user) {
      console.error('POST /api/groups - Unauthorized: No valid session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Group name must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Create a service role client to bypass RLS
    // We've already authenticated the user above, so this is safe
    const { createClient } = await import('@supabase/supabase-js');
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create the group using service role (bypasses RLS)
    const { data: group, error } = await serviceClient
      .from('groups')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        owner_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating group:', error);
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      );
    }

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/groups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
