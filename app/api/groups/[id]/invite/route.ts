// app/api/groups/[id]/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/groups/[id]/invite
 * List pending invitations for a group
 */
export async function GET(
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

    // Get pending invitations
    const { data: invitations, error } = await supabase
      .from('group_invitations')
      .select(`
        id,
        email,
        invite_code,
        status,
        created_at,
        expires_at,
        inviter:inviter_id(
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('group_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    console.error('Error in GET /api/groups/[id]/invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/invite
 * Send an invitation to join the group
 */
export async function POST(
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

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Use service role client for queries that need auth.users access
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

    // Check if user is already a member using service client
    const { data: existingMembers } = await serviceClient
      .from('group_members')
      .select('user_id')
      .eq('group_id', id);

    if (existingMembers) {
      // Get all user emails for these members
      const { data: usersData } = await serviceClient.auth.admin.listUsers();
      const memberEmails = new Set(
        usersData.users
          .filter(u => existingMembers.some(m => m.user_id === u.id))
          .map(u => u.email?.toLowerCase())
      );

      if (memberEmails.has(email.toLowerCase())) {
        return NextResponse.json(
          { error: 'User is already a member of this group' },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await serviceClient
      .from('group_invitations')
      .select('id, created_at')
      .eq('group_id', id)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      // Check if invitation was sent less than 1 minute ago
      const inviteTime = new Date(existingInvite.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - inviteTime.getTime()) / (1000 * 60);

      if (diffMinutes < 1) {
        return NextResponse.json(
          { error: 'Please wait 1 minute before sending another invitation to this email' },
          { status: 429 } // Too Many Requests
        );
      }

      // If more than 1 minute has passed, allow resending by deleting old invitation
      await serviceClient
        .from('group_invitations')
        .delete()
        .eq('id', existingInvite.id);
    }

    // Create invitation using service client
    const { data: invitation, error } = await serviceClient
      .from('group_invitations')
      .insert({
        group_id: id,
        inviter_id: user.id,
        email: email.toLowerCase()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Invitation sent successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/groups/[id]/invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/invite
 * Cancel a pending invitation
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
    const { invitation_id } = body;

    if (!invitation_id) {
      return NextResponse.json(
        { error: 'invitation_id is required' },
        { status: 400 }
      );
    }

    // Cancel the invitation (RLS will check permissions)
    const { error } = await supabase
      .from('group_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitation_id)
      .eq('group_id', id);

    if (error) {
      console.error('Error cancelling invitation:', error);
      return NextResponse.json(
        { error: 'Failed to cancel invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/groups/[id]/invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
