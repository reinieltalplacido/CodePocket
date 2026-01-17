// app/api/groups/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/groups/[id]
 * Get group details with members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const resolvedParams = await params;
    
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

    // Get group details with members
    const { data: group, error } = await serviceClient
      .from('groups')
      .select(`
        *,
        members:group_members(
          id,
          user_id,
          joined_at
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      console.error('Error fetching group:', error);
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Add is_owner flag
    const groupWithOwnership = {
      ...group,
      is_owner: group.owner_id === user.id,
      member_count: group.members?.length || 0
    };

    return NextResponse.json({ group: groupWithOwnership });
  } catch (error) {
    console.error('Error in GET /api/groups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/[id]
 * Update group details (owner only)
 */
export async function PATCH(
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
    const { name, description } = body;

    // Validate input
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Group name cannot be empty' },
          { status: 400 }
        );
      }
      if (name.length > 100) {
        return NextResponse.json(
          { error: 'Group name must be 100 characters or less' },
          { status: 400 }
        );
      }
    }

    if (description !== undefined && description !== null && description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Update the group (RLS will ensure only owner can update)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;

    const { data: group, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating group:', error);
      return NextResponse.json(
        { error: 'Failed to update group. You may not have permission.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error in PATCH /api/groups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * Delete a group (owner only)
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

    // Delete the group (RLS will ensure only owner can delete)
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting group:', error);
      return NextResponse.json(
        { error: 'Failed to delete group. You may not have permission.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
