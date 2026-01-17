// app/api/groups/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/groups/[id]/members
 * List all members of a group
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
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

    // Use service role client
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

    // Get group members with profile data
    // First get the members
    const { data: membersList, error: membersError } = await serviceClient
      .from('group_members')
      .select('id, user_id, joined_at')
      .eq('group_id', id)
      .order('joined_at', { ascending: true });

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    if (!membersList || membersList.length === 0) {
      return NextResponse.json({ members: [] });
    }

    // Get user IDs
    const userIds = membersList.map(m => m.user_id);

    // Fetch auth.users data
    const { data: usersData } = await serviceClient.auth.admin.listUsers();
    const usersMap = new Map(
      usersData.users
        .filter(u => userIds.includes(u.id))
        .map(u => [u.id, { email: u.email }])
    );

    // Fetch profiles data
    const { data: profilesData } = await serviceClient
      .from('profiles')
      .select('user_id, username, display_name, avatar_url')
      .in('user_id', userIds);

    const profilesMap = new Map(
      (profilesData || []).map(p => [p.user_id, p])
    );

    // Combine the data
    const members = membersList.map(member => ({
      ...member,
      users: usersMap.get(member.user_id) || null,
      profiles: profilesMap.get(member.user_id) || null,
    }));

    const error = null;

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    return NextResponse.json({ members: members || [] });
  } catch (error) {
    console.error('Error in GET /api/groups/[id]/members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/members
 * Remove a member from the group (owner only or self-removal)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Check if user is the owner
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', id)
      .single();

    // Prevent owner from removing themselves
    if (user_id === group?.owner_id) {
      return NextResponse.json(
        { error: 'Cannot remove the group owner' },
        { status: 400 }
      );
    }

    // Remove the member (RLS will check permissions)
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', id)
      .eq('user_id', user_id);

    if (error) {
      console.error('Error removing member:', error);
      return NextResponse.json(
        { error: 'Failed to remove member. You may not have permission.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]/members:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
